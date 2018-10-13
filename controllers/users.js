const {User} = require('../models')

exports.getUserProfile = (req, res, next) => {
    const {username} = req.params

    User.findOne({username : username})
        .then(userProfile => {
            if (!userProfile) return Promise.reject({status: 404, msg:`username ${username} does not exist`})
            res.status(200).send({userProfile})
        })
        .catch(next)
}