const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/utils/errorController');
// HERE WE INSERE ROUTES 
const studentRouter = require('./src/student/studentRoute');
const groupeRouter = require('./src/groupe/groupeRoute');
const evaluationRouter = require('./src/evaluation/evaluationRoute');
const coachRouter = require('./src/coach/coachRoute');
const parentRouter = require('./src/parent/parentRoute');
const presenceRouter = require('./src/presence/presenceRoute');
const administrateurRouter = require('./src/administrateur/administrateurRoute');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);
// Set security HTTP headers
app.use(helmet());

// Prevent parameter pollution NOT YET
app.use(
  hpp({
    whitelist: [
      'limit', 
    ],
  })
);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against XSS
app.use(xss());

// routes
 app.use('/api/v1/student', studentRouter);
 app.use('/api/v1/admin', administrateurRouter);
 app.use('/api/v1/coach', coachRouter);
 app.use('/api/v1/groupe', groupeRouter);
 app.use('/api/v1/parent', parentRouter);
 app.use('/api/v1/evaluation', evaluationRouter);
 app.use('/api/v1/presence', presenceRouter);
 

// we might use pug as template engine later 
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find the ${req.originalUrl} on this server`, 404));
  });
  
app.use(globalErrorHandler);
  
  module.exports = app;
  