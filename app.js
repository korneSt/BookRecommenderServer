var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var cors = require('cors')
var app = express();

import * as recommender from './recommender';
import * as db from './db'

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use(function(req, res, next) {
  req.header('Content-Type', 'application/json');  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Content-Type', 'application/json');

  next();
});

app.use('/', index);
// app.use('/users', users);

//API
app.post('/api/v1.0/login', db.login);
app.get('/api/v1.0/c', db.addUser);
app.get('/api/v1.0/books', db.getBooksDB);
app.get('/api/v1.0/books/:id', db.getUserBooks);
app.post('/api/v1.0/book', db.addNewBook);

app.post('/api/v1.0/model', recommender.createModel);
app.get('/api/v1.0/recommendationUser', recommender.getUserRecommendation);
app.get('/api/v1.0/recommendationItem', recommender.getItemRecommendation);
app.post('/api/v1.0/postUsageFile', recommender.postUsageFile);
app.post('/api/v1.0/postCatalogFile', recommender.postCatalogFile);
app.patch('/api/v1.0/updateCatalogFile', recommender.updateCatalogFile);
app.post('/api/v1.0/triggerBuild', recommender.triggerBuild);

// app.get('/api/v1.0/test', db.test);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
