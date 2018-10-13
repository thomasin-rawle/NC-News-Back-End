process.env.NODE_ENV = 'test';
const app = require('../app');
const {expect} = require('chai');
const mongoose = require('mongoose');
const request = require('supertest')(app);
const seedDB = require('../seed/seed');
const data = require('../seed/testData')

describe('/api', () => {
    let articleDocs, commentsDocs, usersDocs, topicsDocs;
    beforeEach(() => {
        return seedDB(data)
            .then(docs => {
                [articleDocs, commentsDocs, usersDocs, topicsDocs] = docs;
            })
    })
    after(() => {
        return mongoose.disconnect()
    })
    it('returns 404 for any method on a non existent url', () => {
        return request.get('/fake-url')
        .expect(404)
        .then(({body}) => {
            expect(body.msg).to.equal('/fake-url does not exist')
        });
    })
    describe('/topics', () => {
        it('GET returns 200 and all topics', () => {
            return request.get('/api/topics')
                .expect(200)
                .then(({body}) => {
                    expect(body.allTopics).to.be.an('Array')
                    expect(body.allTopics).to.have.length(2)
                    expect(body.allTopics[0]).to.have.keys('title', 'slug', '_id', '__v')
                    expect(body.allTopics[1].title).to.equal('Cats');
                })
        });
        describe('/:topic_slug/articles', () => {
            it('GET returns 200 and all articles belonging to topic', () => {
                return request.get('/api/topics/cats/articles')
                    .expect(200)
                    .then(({body}) => {
                        expect(body.articlesInTopic).to.have.length(2)
                        expect('Content-Type', /json/);
                        expect(body.articlesInTopic[0]).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "title",
                            "created_by",
                            "body",
                            "belongs_to",
                            "comment_count",
                            "__v"
                            )
                            expect(body.articlesInTopic[0].comment_count).to.equal(2)
                    })
            })
            it('GET returns 404 when topic slug does not exist', () => {
                return request.get('/api/topics/dogs/articles')
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).to.equal('no articles found on that topic')
                    })
            });
            it('POST returns a status 201 and adds a new article and returns that article', () => {
                return request.post('/api/topics/cats/articles')
                    .send({ 
                        "title": "Safety at risk when cat is near?",
                        "created_by": `${usersDocs._id}`,
                        "body": "I've never met a cat that I didn't like. Said nobody ever."
                    })
                    .expect(201)
                    .then(({body}) => {
                        expect(body.article.title).to.equal('Safety at risk when cat is near?')
                        expect(body.article).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "title",
                            "created_by",
                            "body",
                            "belongs_to",
                            "comment_count",
                            "__v"
                            )
                    })
            })
            it('POST returns 400 when article insertion does not meet schema criteria', () => {
                return request.post('/api/topics/cats/articles')
                    .send({ 
                        "title": 'Safety at risk when cat is near?',
                        "body": "I've never met a cat that I didn't like. Said nobody ever."
                    })
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).to.equal('article not properly formatted')
                    })
            });
        })
    });
    describe('/articles', () => {
        it('GET returns 200 and all articles', () => {
            return request.get('/api/articles')
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).to.be.an('Array')
                    expect(body.articles).to.have.length(4)
                    expect('Content-Type', /json/);
                    expect(body.articles[0]).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "title",
                            "created_by",
                            "body",
                            "belongs_to",
                            "comment_count",
                            "__v"
                            )
                    expect(body.articles[0]._id).to.equal(`${articleDocs._id}`);
                    expect(body.articles[0]).to.include({'comment_count' : 2})
                    expect(body.articles[1]).to.include({'comment_count' : 2})
                })
        });
        describe('/:article_id', () => {
            it('GET returns 200 and an article when given valid id', () => {
                return request.get(`/api/articles/${articleDocs._id}`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.article.title).to.equal('Living in the shadow of a great man')
                        expect(body.article).to.be.an('Object')
                        expect(body.article).to.include({'comment_count' : 2})
                    })
            });
            it('GET returns 404 when article id is valid mongo id not in articles', () => {
                return request.get(`/api/articles/${topicsDocs._id}`)
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).to.equal('article not found')
                    })
            });
            it('GET returns 400 when article id not valid mongo id', () => {
                return request.get('/api/articles/turtle')
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).to.equal('invalid article id')
                    })
            });
            it('PATCH returns 200 and adds one to the vote count', () => {
                return request.patch(`/api/articles/${articleDocs._id}?vote=up`)
                    .expect(200)
                    .then(({body})=> {
                        expect(body.article.votes).to.equal(1)
                        expect(body.article).to.include({'comment_count' : 2})
                    })
            });
            it('PATCH returns 200 and removes one from the vote count', () => {
                return request.patch(`/api/articles/${articleDocs._id}?vote=down`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.article.votes).to.equal(-1)
                    })
            });
            it('PATCH returns 200 and ignores query', () => {
                return request.patch(`/api/articles/${articleDocs._id}?vote=ken_bruce`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.article.votes).to.equal(0)
                    })    
            });
            describe('/comments', () => {
                it('GET returns 200 and an articles comments by article id', () => {
                    return request.get(`/api/articles/${articleDocs._id}/comments`)
                        .expect(200)
                        .then(({body}) => {
                            expect(body.comments).to.have.length(2)
                            expect(body.comments).to.be.an('Array')
                            expect(body.comments[0].votes).to.equal(7)
                        })
                });
                it('GET returns 404 when article has no comments', () => {
                    return request.get(`/api/articles/${topicsDocs._id}/comments`)
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).to.equal('no comments found')
                    })
                });
                it('GET returns 400 when article id not valid mongo id', () => {
                    return request.get('/api/articles/turtle/comments')
                        .expect(400)
                        .then(({body}) => {
                            expect(body.msg).to.equal('invalid article id')
                        })
                });
                it('POST returns 201 and adds a new comment to an article', () => {
                    return request.post(`/api/articles/${articleDocs._id}/comments`)
                        .send({
                            "body": "This is my new comment", 
                            "created_by": `${usersDocs._id}`
                        })
                        .expect(201)
                        .then(({body}) => {
                            expect(body).to.be.an('Object')
                            expect(body.comment).to.have.all.keys(
                              'body',
                              'votes',
                              'created_at',
                              'belongs_to',
                              'created_by',
                              '__v',
                              '_id'
                            )
                            expect(body.comment.created_by).to.be.an('Object')
                            expect(body.comment.belongs_to).to.be.an('Object')
                            expect(body.comment.belongs_to.belongs_to).to.equal('mitch')
                           
                        })
                });
                it('POST returns 400 when comment does not meet schema criteria', () => {
                    return request.post(`/api/articles/${articleDocs._id}/comments`)
                        .send({
                            "created_by": `${usersDocs._id}`
                        })
                        .expect(400)
                        .then(({body}) => {
                            expect(body.msg).to.equal('comment not properly formatted')  
                        })
                });
                it('POST returns 400 article id not a valid id', () => {
                    return request.post(`/api/articles/pinapples/comments`)
                        .send({
                            "body": "This is my new comment", 
                            "created_by": `${usersDocs._id}`
                        })
                        .expect(400)
                        .then(({body}) => {
                            expect(body.msg).to.equal('invalid article id')  
                        })
                });
                it('POST returns 404 when article id is valid mongo id but not in articles', () => {
                    return request.post(`/api/articles/${topicsDocs._id}/comments`)
                        .send({
                            "body": "This is my new comment", 
                            "created_by": `${usersDocs._id}`
                        })
                        .expect(404)
                        .then(({body}) => {
                           
                            expect(body.msg).to.equal('commenting on non-existent article')  
                        })
                });
            })
        })
    })
    describe('/comments', () => {
        it('GET returns 200 and all comments', () => {
            return request.get('/api/comments')
                .expect(200)
                .then(({body}) => {
                   
                    expect(body.comments).to.be.an('Array')
                    expect(body.comments).to.have.length(8)
                    expect(body.comments[0]).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "body",
                            "belongs_to",
                            "created_by",
                            "__v"
                            )
                    expect(body.comments[0]._id).to.equal(`${commentsDocs._id}`);
                })
        });
        describe('/:comment_id', () => {
            it('PATCH returns 200 and adds one to the vote count of a comment', () => {
                return request.patch(`/api/comments/${commentsDocs._id}?vote=up`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.comment.votes).to.equal(8)
                    })
            });
            it('PATCH returns 200 and removes one from the vote count of a comment', () => {
                return request.patch(`/api/comments/${commentsDocs._id}?vote=down`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.comment.votes).to.equal(6)
                    })
            });
            it('PATCH returns 200 and removes one from the vote count of a comment', () => {
                return request.patch(`/api/comments/${commentsDocs._id}?penguins=cool`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.comment.votes).to.equal(7)
                    })
            });
            it('DELETE returns 200 and removes the requested comment', () => {
                return request.delete(`/api/comments/${commentsDocs._id}`)
                    .expect(200)
                    .then(({body})=> {
                        expect(body.msg).to.equal('Comment has been successfully deleted')
                        return request.get('/api/comments')
                    })
                    .then(({body}) => {
                        expect(body.comments.length).to.equal(7)
                    })

            });
            it('DELETE returns 404 when comment has a valid id but does not exist', () => {
                return request.delete(`/api/comments/${topicsDocs._id}`)
                    .expect(404)
                    .then(({body})=> {
                        expect(body.msg).to.equal('Comment does not exist')
                    })
            });
            it('DELETE returns 400 when comment has an invalid id', () => {
                return request.delete(`/api/comments/falafel`)
                    .expect(400)
                    .then(({body})=> {
                        expect(body.msg).to.equal('Comment id falafel is not valid')
                    })
            });
        })
    })
    describe('/users', () => {
        describe('/:username', () => {
            it('GET returns 200 and when passed a username, returns user profile', () => {
                return request.get('/api/users/dedekind561')
                    .expect(200)
                    .then(({body})=> {
                        expect(body.userProfile).to.have.keys(
                            '_id',
                            'username',
                            'name',
                            'avatar_url',
                            "__v"
                        )
                        expect(body.userProfile.name).to.equal('mitch')
                    })
            });
            it('GET returns 404 when passed a username that doesnt exist', () => {
                return request.get('/api/users/tommy')
                    .expect(404)
                    .then(({body})=> {
                        expect(body.msg).to.equal('username tommy does not exist')  
                    })
            });
          
        })
    })

})