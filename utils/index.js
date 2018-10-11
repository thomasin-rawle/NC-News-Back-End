
const createUserRef = (userDocs) => {
    return userDocs.reduce((acc, user) => {
      acc[user.username] = user._id;
      return acc;
    }, {});
  }

exports.formatArticles = (articleData, topicsDocs, userDocs) => {
  return articleData.map(articleDatum => {
    const belongs_to = articleDatum.topic // should probably use topicsDocs.slug
    const userRef = createUserRef(userDocs)
    const created_by = userRef[articleDatum.created_by]
    return { ...articleDatum, belongs_to, created_by };
  });
};

 exports.formatComments = (commentData, articleDocs, userDocs) => {
        return commentData.map(commentDatum => {
            const userRef = createUserRef(userDocs)
            const articleRef = articleDocs.reduce((acc, article) => {
                acc[article.title] = article._id;
                return acc;
              }, {});
            const belongs_to = articleRef[commentDatum.belongs_to]
            const created_by = userRef[commentDatum.created_by]
            return { ...commentDatum, belongs_to, created_by }
        })
    }
