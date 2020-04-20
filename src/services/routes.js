const fs = require('fs')
const path = require('path')
const lodash = require('lodash')

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const middlewares = require('../middlewares')
const YAML = require('yaml')
const routesConfig  = require('../../configs').routes

const routes = YAML.parse(fs.readFileSync(path.join(routesConfig.resource, 'index.yml'), 'utf8'))

lodash.forOwn(routes, function (route, name) {
    const methods = route.methods || ['GET']
    const routeMiddlewares =  [
        middlewares.routeSpecValidator.validateRequest({ spec: route.spec }),
        middlewares.routeSpecValidator.validateResponse({ spec: route.spec })
    ]
    const routeDefinedMiddlewares = route.middlewares || []
    routeDefinedMiddlewares.forEach(function (middleware) {
        if (!lodash.has(middlewares, middleware)) {
            throw new Error(`Middleware ${middleware} does not exists`)
        }

        routeMiddlewares.push(lodash.get(middlewares, middleware))
    })

    if (!lodash.has(controllers, route.controller)) {
        throw new Error(`Controller ${route.controller} does not exists`)
    }
    methods.forEach(function (method) {
        router[method.toLowerCase()](route.path, routeMiddlewares, lodash.get(controllers, route.controller))
    })
})

router.use(middlewares.error)

router.use('*', function(req, res) {
    if (!res.headersSent) {
        res.status(404).send({ message: 'Page not found', code: 'API-0404' })
    }
})


module.exports = router