var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');






var app = express();

// conectar a la base de datos
require('./lib/connectMongoose');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/pdf', express.static('d:/pdfs'));

app.locals.title = 'NodeAPI'; // variables locales en todas las vistas

app.use((req, res, next) => {
  // Una de dos:
  //  - Responder
  // res.send('que tal');
  //  - O pasar el siguiente middleware
  // console.log('llegó una petición de tipo', req.method);
  next();
  //  - O llamar a next con error
  // next(new Error('esto va mal, amigo'));
});

/**
 * Rutas del API
 */
app.use('/api/anuncios', require('./routes/api/anuncios'));

/**
 * Rutas del website
 */
app.use('/',      require('./routes/index'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (err.array) { // error de validación
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPIRequest(req) ?
      { message: 'Not valid', errors: err.mapped()}
      : `El parámetro ${errInfo.param} ${errInfo.msg}`;
  }

  res.status(err.status || 500);

  if (isAPIRequest(req)) {
    res.json({ error: err.message });
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
});

function isAPIRequest(req) {
  return req.originalUrl.startsWith('/api/');
}

module.exports = app;
