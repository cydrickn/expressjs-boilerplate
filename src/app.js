const express = require('express')
const { port } = require('../configs')

const app = express()

// app.use(bodyParser.json())
app.use(require('./services/routes'))

app.listen(port, () => console.log(`Server up listening on port ${port}`))
