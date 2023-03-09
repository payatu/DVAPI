const express = require('express');
const app = express();
const port = 3000;
const router = require('./routes/routes');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(router);
app.set('view engine', 'ejs');

app.listen(port, () => console.log(`Example app listening on port ${port}!`)
);