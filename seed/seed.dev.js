const mongoose = require('mongoose');
const seedDB = require('./seed');
const {DB_URL} = require('../config');
const data = require('./devData')

mongoose.connect(DB_URL)
  .then(() => seedDB(data))
  .then(() => mongoose.disconnect());