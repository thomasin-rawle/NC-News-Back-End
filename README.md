# Northcoders News API


Northcoders News is a RESTful API that uses express and serves data from a mongoDB database. 

Users can view and post articles related to topics of interest as well as comment and vote on them too.

[Click this link to view my live version of Northcoders News](https://nc-news-tommy.herokuapp.com/api)


## Getting Started

### Prerequisites

You will need to have [MongoDB 4v.0](https://www.mongodb.com/download-center) and [Node v8.6.0](https://nodejs.org/en/download/) or later installed.

### Installing

1. Fork this repository to your own GitHub account
2. Clone it to your local machine and `cd` into it

```
$ git clone <your fork's url>
$ cd BE2-northcoders-news
```

3. Install all package dependencies
```
$ npm install
```
The dependencies that will install are:
* express: ^4.16.3
* mongoose: ^5.0.14
* body-parser: ^1.15.2
#### Dev dependencies
* chai: ^4.1.2
* mocha: ^5.0.5
* supertest: ^3.0.0
* nodemon: ^1.17.4

4. Create a config folder with an index.js file inside. 
```
$ mkdir config
$ cd config
$ touch index.js
```

5. You will then need to write a config object in that file which will point to the relevant database for the environment you're running.

    I recommend you copy and paste the code below
```js
const env = process.env.NODE_ENV || 'development'

const config = {
    'development' : {
        DB_URL : 'mongodb://localhost:27017/nc_news'
    },
    'test' : {
        DB_URL : 'mongodb://localhost:27017/nc_news_test'
    }
}

module.exports = config[env];
```

6. Run mongod in a new terminal tab/window. **Remember to keep this running the whole time**

```
$ mongod
```

## Seeding

Once everything has been installed and setup, you will need to seed the database. 

To do this, run the seed.dev.js file by entering the following command into your terminal:

```
$ npm run seed:dev
```

You should now have successfully seeded the database. 

*To check this you can open a new terminal tab and enter the command `$ mongo` followed by `$ show dbs`. There should be a database called 'nc_news'.*

## Testing

To run the API in it's test environment, enter the following command:

```
$ npm test
```

Tests have been made for each end-point. They check the correct information is returned for successful HTTP requests and appropriate errors are returned for unsuccessful requests.

## Development

To run the API in it's development environment, enter the following command:

```
$ npm run dev
```

This will start up the server and you should see a console log telling you that it is listening on port 9090.

When you make a change to the API and save it, the server will automatically re-start and begin listening again.

## Routes

The following end-points are available straight away:

```http
GET /api 
# Serves an HTML page with documentation for all the available endpoints
```

```http
GET /api/topics
# Get all the topics
```

```http
GET /api/topics/:topic_slug/articles
# Return all the articles for a certain topic
# e.g: `/api/topics/football/articles`
```

```http
POST /api/topics/:topic_slug/articles
# Add a new article to a topic. This route requires a JSON body with title and body key value pairs
# e.g: `{ "title": "new article", "body": "This is my new article content", "created_by": "user_id goes here"}`
```

```http
GET /api/articles
# Returns all the articles
```

```http
GET /api/articles/:article_id
# Get an individual article
```

```http
GET /api/articles/:article_id/comments
# Get all the comments for a individual article
```

```http
POST /api/articles/:article_id/comments
# Add a new comment to an article. This route requires a JSON body with body and created_by key value pairs
# e.g: `{"body": "This is my new comment", "created_by": "user_id goes here"}`
```

```http
PATCH /api/articles/:article_id
# Increment or Decrement the votes of an article by one. This route requires a vote query of 'up' or 'down'
# e.g: `/api/articles/:article_id?vote=up`
```

```http
PATCH /api/comments/:comment_id
# Increment or Decrement the votes of a comment by one. This route requires a vote query of 'up' or 'down'
# e.g: `/api/comments/:comment_id?vote=down`
```

```http
DELETE /api/comments/:comment_id
# Deletes a comment
```

```http
GET /api/users/:username
# e.g: `/api/users/mitch123`
# Returns a JSON object with the profile data for the specified user.
```

## Deployment

My live Northcoders News app has been deployed using [Heroku](https://www.heroku.com/) and [mLabs](https://mlab.com/). 

I recommend using these services too for easy deployment.

[Follow this tutorial to find out how](https://www.sitepoint.com/deploy-rest-api-in-30-mins-mlab-heroku/)

## Authors

Thomasin Rawle 

## Acknowledgements

All the tutors at Northcoders and cohort 23 for being the best!
