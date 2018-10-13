const router = require('express').Router();
const {getComments, updateCommentVotes, deleteComment} = require('../controllers/comments')

router.route('/')
    .get(getComments)
router.route('/:comment_id')
    .patch(updateCommentVotes)
    .delete(deleteComment)


module.exports = router