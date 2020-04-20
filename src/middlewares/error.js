const { vsprintf } = require('sprintf-js')
const { errors } = require('../../configs')
const SchemaError = require('../errors/SchemaError')
const ErrorResponse = require('../errors/ErrorResponse')


function generateError(code, options) {
    options = options || {}
    if (errorExists(code)) {
        const message = options.message || this.errors[code].message
        const errors = options.errors || []
        return { code, message: vsprintf(message, options), errors }
    }
    throw new Error('Error code does not exists')
}

function getErrorHttpCode(code) {
    if (errorExists(code)) {
        return errors[code].httpCode
    }
    throw new Error('Error code does not exists')
}

function errorExists(code) {
    return code in errors
}


module.exports = (err, req, res, next) => {
    if (err && !res.headersSent) {
        if (err instanceof SchemaError) {
            const error = generateError(err.code, { message: err.message, errors: err.errors })
            if (!err.showErrors) {
                delete error.errors
            }
            res.status(getErrorHttpCode(err.code)).json(error)
        } else if (err instanceof ErrorResponse) {
            res.status(err.httpCode).send({ code: err.code, message: err.message })
        } else if (err.code && errorExists(err.code)) {
            const error = generateError(err.code, { message: err.message })
            if (err.errors) {
                error.errors = err.errors
            }
            res.status(getErrorHttpCode(err.code)).send(error)
        } else {
            res.status(500).send({ message: 'Something went wrong', errorId: req.requestId, debug: err })
        }
    }
    next()
}
