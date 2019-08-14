"use strict";

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const config = require('config'); //http://lorenwest.github.io/node-config/
const usersRouter = require('./routes/users');
const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.get('app.session_secret'),
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false
}));

// CORS - must be initialized before the routes !
const whitelist = ['http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error('Origin ' + origin + ' is not allowed by CORS!');
            callback(new Error('Origin ' + origin + ' is not allowed by CORS!'));
        }
    }, credentials: true
};

app.options('*', cors(corsOptions));
app.use('*', cors(corsOptions));

require('./modules/users/auth/local-strategy')(passport); // load the local strategy to passport
app.use(passport.initialize());
app.use(passport.session());
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
});

module.exports = app;
