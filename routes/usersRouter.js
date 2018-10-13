const router = require('express').Router();
const {getUserProfile} = require('../controllers/users')

router.route('/:username')
    .get(getUserProfile)

    


module.exports = router