const {Topic, Article, Comment} = require('../models')

exports.getAllTopics = (req, res, next) => {
    Topic.find()
    .then((allTopics) => {
        res.status(200).send({allTopics})
    })
    .catch(next)
}

exports.getTopicArticles = (req, res, next) => {
    const {topic_slug} = req.params
    const articles = Article.find({'belongs_to' : topic_slug }).lean()
    const comments = Comment.find().lean()

    Promise.all([articles.populate('created_by'), comments])
    .then(([articlesInTopic, comments]) => {
        return articlesInTopic.map(article => {
            let passedComments = comments.filter(comment => comment.belongs_to.toString() === article._id.toString())
                 let comment_count = passedComments.length
                return { ...article, comment_count}
        })
    })
    .then(articlesInTopic => {
        if (!articlesInTopic.length) return Promise.reject({status: 404, msg: 'no articles found on that topic'})
        res.status(200).send({articlesInTopic})
    }) 
    .catch(next)
}

exports.postArticleToTopic = (req, res, next) => {
    const {topic_slug} = req.params;
    const body = req.body;
    const post = new Article({
        title: body.title,
        body: body.body,
        belongs_to: topic_slug,
        created_by: body.created_by,
      })
      post.save()
        .then(postedArticle => {
          return Article.findOne({'_id' : postedArticle._id}).lean()
        })
        .then(foundArticle => {
            let comment_count = 0;
            const article = {...foundArticle, comment_count}
            res.status(201).send({article})
        })
        .catch(err => {
            if (err.name === 'ValidationError') next({status: 400, msg: 'article not properly formatted'})
            else next(err)
        })
}



