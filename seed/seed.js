const mongoose = require('mongoose');
const {Topic, User, Article, Comment} = require('../models')
const {formatArticles, formatComments} = require('../utils')

const seedDB = ({topicsData, usersData, articlesData, commentsData}) => {
    return mongoose.connection.dropDatabase()
    .then(() => {
       const topicInsertions = Topic.insertMany(topicsData);
       const userInsertions = User.insertMany(usersData);
       return Promise.all([topicInsertions, userInsertions])
    })
    .then(([topicsDocs, usersDocs]) => {
        const formattedArticles = formatArticles(articlesData, topicsDocs, usersDocs)
        const articleInsertions = Article.insertMany(formattedArticles)
        return Promise.all([articleInsertions, usersDocs, topicsDocs])
    })
    .then(([articleDocs, usersDocs, topicsDocs]) => {
        const formattedComments = formatComments(commentsData, articleDocs, usersDocs)
        return Promise.all([articleDocs, Comment.insertMany(formattedComments), usersDocs, topicsDocs])
    })
    .then(([articleDocs, commentsDocs, usersDocs, topicsDocs]) => {
        return [articleDocs[0], commentsDocs[0], usersDocs[0], topicsDocs[0]];
      })
}


module.exports = seedDB;