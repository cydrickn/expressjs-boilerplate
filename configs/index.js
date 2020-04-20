const path = require('path')
const dotEnv = require('dotenv')
const rootFolder = path.resolve(__dirname, '../')
dotEnv.config()

module.exports = {
    rootFolder,
    port: process.env.HTTP_PORT,
    routes: {
        resource: path.join(rootFolder, '/configs/routes/'),
        specs: path.join(rootFolder, '/configs/schemas/requests'),
    },
    errors: {
        'SCH-1001': { httpCode: 422, message: 'Invalid request' },
        'SCH-1002': { httpCode: 500, message: 'Something went wrong' },
    }
}