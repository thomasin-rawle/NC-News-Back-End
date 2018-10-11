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
                .then(res => {
                    expect(res.body).to.be.an('Array')
                    expect(res.body).to.have.length(2)
                    expect(res.body[0]).to.have.keys('title', 'slug', '_id', '__v')
                    expect(res.body[1].title).to.equal('Cats');
                })
        });
        describe('/:topic_slug/articles', () => {
            it('GET returns 200 and all articles belonging to topic', () => {
                return request.get('/api/topics/cats/articles')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.length(2)
                        expect('Content-Type', /json/);
                        expect(res.body[0]).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "title",
                            "created_by",
                            "body",
                            "belongs_to",
                            "__v"
                            )
                        
                    })
            })
            it('GET returns 404 when topic slug does not exist', () => {
                return request.get('/api/topics/dogs/articles')
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).to.equal('no articles found on that topic')
                    })
            });
        });
        describe('/:topic_slug/articles', () => {
            it('POST returns a status 201 and adds a new article and returns that article', () => {
                return request.post('/api/topics/cats/articles')
                    .send({ 
                        "title": "Safety at risk when cat is near?",
                        "created_by": `${usersDocs._id}`,
                        "body": "I've never met a cat that I didn't like. Said nobody ever."
                    })
                    .expect(201)
                    .then(res => {
                        expect(res.body.article.title).to.equal('Safety at risk when cat is near?')
                        expect(res.body.article).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "title",
                            "created_by",
                            "body",
                            "belongs_to",
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
                .then(res => {
                    expect(res.body).to.be.an('Array')
                    expect(res.body).to.have.length(4)
                    expect('Content-Type', /json/);
                    expect(res.body[0]).to.have.keys(
                            "votes",
                            "created_at",
                            "_id",
                            "title",
                            "created_by",
                            "body",
                            "belongs_to",
                            "__v"
                            )
                    expect(res.body[0]._id).to.equal(`${articleDocs._id}`);
                })
        });
        describe('/:article_id', () => {
            it('GET returns 200 and an article when given valid id', () => {
                return request.get(`/api/articles/${articleDocs._id}`)
                    .expect(200)
                    .then(({body}) => {
                        expect(body.article.title).to.equal('Living in the shadow of a great man')
                        expect(body).to.be.an('Object')
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
            it.only('PATCH returns 201 and adds one to the vote count', () => {
                return request.patch(`/api/articles/${articleDocs._id}?vote=up`)
                    .expect(201)
                    .then(res => {
                        expect(res.body.votes).to.equal(1)
                    })
                   
            });
            describe('/comments', () => {
                it('GET returns 200 and an articles comments by article id', () => {
                    return request.get(`/api/articles/${articleDocs._id}/comments`)
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.length(2)
                            expect(res.body).to.be.an('Array')
                            expect(res.body[0].votes).to.equal(7)
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
                            expect(body.comment.created_by).to.equal(`${usersDocs._id}`)
                            expect(body.comment.belongs_to).to.equal(`${articleDocs._id}`)
                           
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
 
})