const {Topic, Article} = require('../models')

exports.getAllTopics = (req, res, next) => {
    Topic.find()
    .then((allTopics) => {
        res.status(200).send(allTopics)
    })
    .catch(next)
}

exports.getTopicArticles = (req, res, next) => {
    const {topic_slug} = req.params
    Article.find({'belongs_to' : topic_slug })
    .then(articlesInTopic => {
        if (!articlesInTopic.length) return Promise.reject({status: 404, msg: 'no articles found on that topic'})
        res.send(articlesInTopic)
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
        created_by: body.created_by
      })
      post.save()
        .then(article => {
            res.status(201).send({article})
        })
        .catch(err => {
            if (err.name === 'ValidationError') next({status: 400, msg: 'article not properly formatted'})
            else next(err)
        })
}



