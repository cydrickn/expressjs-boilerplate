const fs = require('fs')
const path = require('path')
const lodash = require('lodash')
const YAML = require('yaml')
const { routes } = require('../../configs')
const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true, verbose: true })

function resourceRequest(resource) {
    const specs = YAML.parse(fs.readFileSync(path.join(routes.specs, resource), 'utf8'))

    return lodash.mapValues(specs, function (spec) {
        if (spec.resource) {
            return resourceRequest(spec.resource)
        } else {
            return spec
        }
    })
}

function generateRequestSchema(contentType, spec) {
    const specParameters = spec.parameters || []
    const definition = {
        type: 'object',
        properties: {
            query: { type: 'object' },
            path: { type: 'object' },
            header: { type: 'object' }
        }
    }
    for (const i in specParameters) {
        const param = specParameters[i]
        definition.properties[param.in].properties = definition.properties[param.in].properties || {}
        definition.properties[param.in].properties[param.name] = param.schema
        if (param.required) {
            definition.properties[param.in].required = definition.properties[param.in].required || []
            definition.properties[param.in].required.push(param.name)
        }
    }

    if (lodash.has(spec, `requestBody.content.${contentType}`)) {
        definition.properties.body = spec.requestBody.content[contentType].schema
        if (spec.requestBody.required) {
            definition.required = definition.required || []
            definition.required.push('body')
        }
    }

    return definition
}

function generateResponseSchemas(status, contentType, spec) {
    if (!lodash.has(spec,`responses.${status}.content.${contentType}`)) {
        return null
    }

    return lodash.get(spec,`responses.${status}.content.${contentType}.schema`)
}



function generateSchemaData(req) {
    const schema = {
        query: req.query,
        path: req.params,
        headers: req.headers
    }

    if (req.body) {
        schema.body = req.body
    }

    return schema
}

function validate (data, schema) {
    const validate = ajv.compile(schema)
    const valid = validate(data)

    return {
        valid,
        errors: validate.errors
    }
}


exports.validateRequest = function (req, spec) {
    const reqData = generateSchemaData(req)
    const schema = generateRequestSchema(req.get('Content-Type'), spec)

    return validate(reqData, schema)
}

exports.validateResponse = function (res, data, spec) {
    const contentTypePart = res.get('Content-Type').split('; ')

    const schema = generateResponseSchemas(res.statusCode, contentTypePart[0], spec)
    if (schema === null) {
        return { valid: true }
    }

    if (typeof data === 'string' && contentTypePart[0] === 'application/json') {
        data = JSON.parse(data)
    }

    return validate(data, schema)
}

exports.validate = validate

exports.requestSpecs = resourceRequest('index.yml')