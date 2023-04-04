const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require('yamljs');

const app = express();

const swaggerDocument = YAML.load('./swagger/swagger-doc.yaml');

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;