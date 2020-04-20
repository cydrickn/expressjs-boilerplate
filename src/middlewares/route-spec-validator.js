const SchemaError = require('../errors/SchemaError')
const lodash = require('lodash')
const schemas = require('../services/schemas')

exports.validateRequest = function (options) {
    const spec = lodash.get(schemas.requestSpecs, options.spec)

    return (req, res, next) => {
        const result = schemas.validateRequest(req, spec)
        if (!result.valid) {
            next(new SchemaError({
                code: 'SCH-1001',
                errors: result.errors,
                messages: {},
                message: 'Invalid Request',
            }))
        } else {
            next()
        }
    }
}

exports.validateResponse = function (options) {
    const spec = lodash.get(schemas.requestSpecs, options.spec)

    return (req, res, next) => {
        const send = res.send
        res.send = function (data) {
            const result = schemas.validateResponse(res, data, spec)
            if (!result.valid) {
                next(new SchemaError({
                    code: 'SCH-1002',
                    errors: result.errors,
                    messages: {},
                    message: 'Invalid Response',
                    showErrors: false,
                }))
            } else {
                return send.apply(this, arguments)
            }
        }
        next()
    }
}