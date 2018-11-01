const {Article, Comment} = require('../models')

exports.getAllArticles = (req, res, next) => {
   Promise.all([Article.find().lean().populate('created_by'), Comment.find().lean()])
        .then(([articles, comments]) => {
            return articles.map(article => {
                let passedComments = comments.filter(comment => comment.belongs_to.toString() === article._id.toString())
                let comment_count = passedComments.length
               return { ...article, comment_count}
            })
        })
        .then(articles => {
               res.status(200).send({articles})
        })
        .catch(next)
}
exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
   
    Article.findById(article_id).lean()
        .populate('created_by')
        .then(article => {
            if (!article) return Promise.reject({status: 404, msg: 'article not found'})
            else return Promise.all([article, Comment.count({'belongs_to': article_id})])
        })
        .then(([oldArticle, comment_count]) => {
            const article = {...oldArticle, comment_count}
            res.status(200).send({article})
        })
        .catch(err => {
            if (err.name === 'CastError') next({status: 400, msg: 'invalid article id'})
            else next(err);
        })
}

exports.getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params
    Comment.find({'belongs_to': article_id})
    .populate('created_by')
    .then(comments => {
        if (!comments.length) return Promise.reject({status: 404, msg: 'no comments found'})
        res.status(200).send({comments})
    })
    .catch(err => {
        if (err.name === 'CastError') next({status: 400, msg: 'invalid article id'})
        else next(err);
    })
}

exports.postCommentToArticle = (req, res, next) => {
    const {article_id} = req.params
    Article.findById(article_id)
    .then(article => {
        if (!article) return Promise.reject({status: 404, msg: 'commenting on non-existent article'})
    })
    .then(()=> {
        const body = req.body;
        const post = new Comment({
            body: body.body,
            belongs_to: article_id,
            created_by: body.created_by
        })
        return post.save()
    })
    .then(newComment => {
       const populatedComment = Comment.findById(newComment._id)
            .populate('created_by')
            .populate('belongs_to')
            return populatedComment
    })
    .then(comment => {
         res.status(201).send({comment})
    })
    .catch(err => {
        if (err.name === 'CastError') next({status: 400, msg: 'invalid article id'})
        else if (err.name === 'ValidationError') next({status: 400, msg: 'comment not properly formatted'})
        else next(err)           
    })
}

exports.updateArticleVotes = (req, res, next) => {
    const {vote} = req.query
    const {article_id} = req.params
    let inc = vote === 'up' ? 1 : vote === 'down' ? -1 : 0

    Article.findByIdAndUpdate(article_id, { $inc: { votes : inc }}, {new: true}).lean()
        .populate('created_by')
        .then(origArticle => {
            return Promise.all([origArticle, Comment.count({'belongs_to' : origArticle._id})])
        })
        .then(([origArticle, comment_count]) => {
            const article = {...origArticle, comment_count}
            res.status(200).send({article})
        })
}