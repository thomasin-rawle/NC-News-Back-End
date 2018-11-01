const {User, Comment, Article} = require('../models')

exports.getUserProfile = (req, res, next) => {
    const {username} = req.params

    User.findOne({username : username})
        .then(userProfile => {
            if (!userProfile) return Promise.reject({status: 404, msg:`username ${username} does not exist`})
            res.status(200).send({userProfile})
        })
        .catch(next)
}

exports.getCommentsByUserId = (req, res, next) => {
    const {user_id} = req.params
    Comment.find({'created_by': user_id})
    .populate('belongs_to')
    .then(comments => {
        if (!comments.length) return Promise.reject({status: 404, msg: 'no comments found'})
        res.status(200).send({comments})
    })
    .catch(err => {
        if (err.name === 'CastError') next({status: 400, msg: 'invalid user id'})
        else next(err);
    })
}

exports.getArticlesByUserId = (req, res, next) => {
    const {user_id} = req.params
    Article.find({'created_by': user_id})
    .populate('created_by')
    .then(articles => {
        if (!articles.length) return Promise.reject({status: 404, msg: 'no articles found'})
        res.status(200).send({articles})
    })
    .catch(err => {
        if (err.name === 'CastError') next({status: 400, msg: 'invalid user id'})
        else next(err);
    })
}