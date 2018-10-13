exports.handle404 = ({status, msg}, req, res, next) => {
    if (status === 404) return res.status(status).send({msg});
    else next({status, msg});
}

exports.handle400 = ({status, msg}, req, res, next) => {
    if (status === 400) return res.status(status).send({msg});
    else next({status, msg});
}

exports.handle500 = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({msg: 'internal server error'});
}