const express = require('express')
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const {DB_URL} = require('./config');
const {topicsRouter, articlesRouter} = require('./routes');
const {handle404, handle400, handle500} = require('./error-handlers')

mongoose.connect(DB_URL)
    .then(() => console.log(`connected to ${DB_URL}`));

//app.use('/api')
app.use(bodyParser.json())
app.use('/api/topics', topicsRouter)
app.use('/api/articles', articlesRouter)
// app.use('/api/comments')
// app.use('/api/users)

app.use('/*', (req, res, next) => next({status: 404, msg: `${req.originalUrl} does not exist`}))
app.use(handle404)
app.use(handle400)
app.use(handle500)
 
// 404 - endpoint doesnt exists
// 404 - param doesnt exist
// 400 - invalid param (bad request)
// 400 - post request doesnt fit with schema

// invalid queries should be ignored



module.exports = app;