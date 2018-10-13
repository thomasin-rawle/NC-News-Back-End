const {Comment} = require('../models')

exports.getComments = (req, res, next) => {
    Comment.find()
    .populate('belongs_to')
    .populate('created_by')
    .then(comments => {
        res.status(200).send(comments)
    })
}

exports.updateCommentVotes = (req, res, next) => {
    const {vote} = req.query
    const {comment_id} = req.params
    let inc = vote === 'up' ? 1 : vote === 'down' ? -1 : 0

    Comment.findByIdAndUpdate(comment_id, { $inc: { votes : inc }}, {new: true})
        .populate('belongs_to')
        .populate('created_by')
        .then(comment => {
            res.status(200).send(comment)
        })
}


exports.deleteComment = (req, res, next) => {
    const {comment_id} = req.params

    Comment.findByIdAndRemove(comment_id)
    .populate('belongs_to')
    .populate('created_by')
    .then((comment) => {
        if (!comment) return Promise.reject({status: 404, msg: 'Comment does not exist'})
        res.status(200).send({msg: 'Comment has been successfully deleted'})
    })
    .catch(err => {
        if(err.name === 'CastError') next({status: 400, msg:`Comment id ${comment_id} is not valid`})
        else next(err)
    })
}