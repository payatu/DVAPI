const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require('yamljs');

const app = express();

const swaggerDocument = YAML.load('./swagger/DVAPI.postman_collection.yaml');

app.use('/swagger', function(req, res, next){
    console.log(req.protocol);
    // Set the server host url to match with the origin
    swaggerDocument['servers'][0]['url'] = req.protocol + '://' + req.get('host');
    req.swaggerDoc = swaggerDocument;
    next();
}, swaggerUi.serveFiles(swaggerDocument, {}), swaggerUi.setup());
module.exports = app;