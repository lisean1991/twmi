const http = require('http');
const port = 18080;
require('babel-register');
const express = require('express'),
    routes = require('./src/routes/index.js'),
    bodyParser = require('body-parser'),
    ejs = require('ejs');
const compression = require('compression');

var app = express();
var server = http.createServer(app);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.use('/log', express.static(process.cwd() + '/src/log'));

routes(app);


server.listen(process.env.PORT || 4001);
console.log("listening...")
