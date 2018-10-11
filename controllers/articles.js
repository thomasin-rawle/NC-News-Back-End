const {Article, Comment} = require('../models')

exports.getAllArticles = (req, res, next) => {
    Article.find()
        .then(articles => {
            res.status(200).send(articles)
        })
        .catch(next)
}

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    Article.findById(article_id)
        .then(article => {
            if (!article) return Promise.reject({status: 404, msg: 'article not found'})
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
    .then(comments => {
        if (!comments.length) return Promise.reject({status: 404, msg: 'no comments found'})
        res.status(200).send(comments)
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
        if (!article) return next({status: 404, msg: 'commenting on non-existent article'})
    })
    .catch(err => {
        if (err.name === 'CastError') next({status: 400, msg: 'invalid article id'})
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
    .then(comment => {
         res.status(201).send({comment})
    })
    .catch(err => {
        if (err.name === 'ValidationError') next({status: 400, msg: 'comment not properly formatted'})
        else next(err)           
    })
}

exports.updateArticleVotes = (req, res, next) => {
    const {vote} = req.query
    const {article_id} = req.params
    let inc = vote === 'up' ? 1 : vote === 'down' ? -1 : 0

    Article.findByIdAndUpdate(article_id, { $inc: { votes : inc }}, {new: true})
        .then(article => {
            res.status(201).send(article)
        })
}


// const validateQuery = (queries, ...validQueries) => {
//     return validQueries.reduce((acc, validQuery) => {
//         if (queries[validQuery]) acc[validQuery] = queries[validQueries];
//         return acc;
//         }, {})
// }
// const validQueries = validateQuery(req.query, 'vote')
// Articles.find(validQueries)

//commenting on non-existent article