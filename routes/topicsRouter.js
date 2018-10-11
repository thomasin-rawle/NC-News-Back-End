const router = require('express').Router();
const {getAllTopics, getTopicArticles, postArticleToTopic} = require('../controllers/topics')

router.route('/')
    .get(getAllTopics)
router.route('/:topic_slug/articles')
    .get(getTopicArticles)
    .post(postArticleToTopic)
    


module.exports = router