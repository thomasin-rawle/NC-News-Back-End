const router = require('express').Router();
const {getAllArticles, getArticleById, getCommentsByArticleId, postCommentToArticle, updateArticleVotes} = require('../controllers/articles')

router.route('/')
    .get(getAllArticles)
router.route('/:article_id')
    .get(getArticleById)
    .patch(updateArticleVotes)
router.route('/:article_id/comments')
    .get(getCommentsByArticleId)
    .post(postCommentToArticle)


module.exports = router