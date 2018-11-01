const router = require('express').Router();
const {getUserProfile, getCommentsByUserId, getArticlesByUserId} = require('../controllers/users')

router.route('/:username')
    .get(getUserProfile)
router.route('/:user_id/comments')
    .get(getCommentsByUserId)
router.route('/:user_id/articles')
    .get(getArticlesByUserId)


module.exports = router