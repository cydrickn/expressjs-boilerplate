class ErrorResponse extends Error {
    constructor(httpCode, code, message, errors) {
        super(message)
        this.httpCode = httpCode
        this.code = code
        this.message = message
        this.errors = errors || {}
    }
}

module.exports = ErrorResponse
