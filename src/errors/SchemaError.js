const { vsprintf } = require('sprintf-js')
const lodash = require('lodash')

class SchemaError extends Error {
    messages = {
        required: '%(field)s is required',
        type: '%(field)s must be %(type)s',
        pattern: '%(field)s should match pattern "%(pattern)s"',
        additionalProperties: 'The field %(field)s should not be included',
        format: '%(field)s %(message)s'
    }


    constructor(options) {
        super(options.message || 'Invalid Schema');
        options = { showErrors: true, ...options }
        this.code = options.code || 'SCH-0001'
        this.schemaErrors = options.errors || {}
        this.message = options.message || 'Invalid Schema'
        this.errors = this.parseErrors(options.errors, options.messages)
        this.showErrors = options.showErrors
    }

    generateMessage(code, context, message) {
        if (context.schema['x-name']) {
            context.field = context.schema['x-name']
        }
        if (message) {
            return lodash.upperFirst(vsprintf(message, context))
        } else {
            return lodash.upperFirst(vsprintf(this.messages[code], context))
        }
    }

    getMessage(messages, property, keyword) {
        let message = null
        if (messages[property] && message[property][keyword]) {
            message = message[property][keyword]
        }

        return message
    }

    parseErrors(errors, messages) {
        const _errors = []
        errors.forEach((error) => {
            if (error.keyword === 'required') {
                const message = this.getMessage(messages, error.params.missingProperty, 'required')
                let map = error.dataPath.substr(1)
                if (error.parentSchema['x-map']) {
                    map = error.parentSchema['x-map']
                }

                _errors.push({
                    map,
                    property: error.params.missingProperty,
                    message: this.generateMessage(
                        'required',
                        { field: error.params.missingProperty, schema: error.parentSchema },
                        message
                    )
                })
            } else if (error.keyword === 'type') {
                const message = this.getMessage(error.dataPath.substr(1), 'type')
                let map = error.dataPath.substr(1)
                if (error.parentSchema['x-map']) {
                    map = error.parentSchema['x-map']
                }

                _errors.push({
                    map,
                    property: error.dataPath.substr(1),
                    message: this.generateMessage(
                        'type',
                        { field: error.dataPath.substr(1), schema: error.parentSchema, ...error.params },
                        message
                    )
                })
            } else if (error.keyword === 'pattern') {
                const message = this.getMessage(error.dataPath.substr(1), 'pattern')
                let map = error.dataPath.substr(1)
                if (error.parentSchema['x-map']) {
                    map = error.parentSchema['x-map']
                }

                _errors.push({
                    map,
                    property: error.dataPath.substr(1),
                    message: this.generateMessage(
                        'pattern',
                        { field: error.dataPath.substr(1), schema: error.parentSchema, ...error.params },
                        message
                    )
                })
            } else if (error.keyword === 'additionalProperties') {
                const message = this.getMessage(error.dataPath.substr(1), 'additionalProperties')
                let map = error.dataPath.substr(1)
                if (error.parentSchema['x-map']) {
                    map = error.parentSchema['x-map']
                }

                _errors.push({
                    map,
                    property: error.params.additionalProperty,
                    message: this.generateMessage(
                        'additionalProperties',
                        { field: error.params.additionalProperty, schema: error.parentSchema, ...error.params },
                        message
                    )
                })
            } else if (error.keyword === 'format') {
                const message = this.getMessage(error.dataPath.substr(1), 'format')
                let map = error.dataPath.substr(1)
                if (error.parentSchema['x-map']) {
                    map = error.parentSchema['x-map']
                }

                _errors.push({
                    map,
                    property: error.dataPath.substr(1),
                    message: this.generateMessage(
                        'format',
                        { field: error.dataPath.substr(1), message: error.message, schema: error.parentSchema, ...error.params },
                        message
                    )
                })
            } else {
                const message = this.getMessage(error.dataPath.substr(1), error.keyword) || '%(field)s %(message)s'
                let map = error.dataPath.substr(1)
                if (error.parentSchema['x-map']) {
                    map = error.parentSchema['x-map']
                }

                _errors.push({
                    map,
                    property: error.dataPath.substr(1),
                    message: this.generateMessage(
                        error.keyword,
                        { field: error.dataPath.substr(1), message: error.message, schema: error.parentSchema, ...error.params },
                        message
                    )
                })
            }
        })

        return _errors
    }
}

module.exports = SchemaError