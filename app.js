const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression')


const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/utils/errorController');
const rateLimit = require('express-rate-limit');
// HERE WE INSERE ROUTES 
const studentRouter = require('./src/student/studentRoute');
const groupeRouter = require('./src/groupe/groupeRoute');
const evaluationRouter = require('./src/evaluation/evaluationRoute');
const coachRouter = require('./src/coach/coachRoute');
const parentRouter = require('./src/parent/parentRoute');
const presenceRouter = require('./src/presence/presenceRoute');
const refreshAdminRouter = require('./src/refreshAdmin/refreshAdminRoute');
const refreshCoachRouter = require('./src/refreshCoach/refreshCoachRoute');
const refreshParentRouter = require('./src/refreshParent/refreshParentRoute');
const administrateurRouter = require('./src/admin/adminRoute');
const historiqueCoachRouter = require('./src/historiqueCoach/historiqueCoachRoute');
const historiqueParentRouter = require('./src/historiqueParent/historiqueParentRoute');
const historiqueStudentRouter = require('./src/historiqueStudent/historiqueStudentRoute');
const historiqueGroupeRouter = require('./src/historiqueGroupe/historiqueGroupeRoute');
const historiqueEvaluationRouter = require('./src/historiqueEvaluation/historiqueEvaluationRoute');
const historiquePresenceRouter = require('./src/historiquePresence/historiquePresenceRoute');
const subscriptionAdminRouter = require('./src/subscriptionAdmin/subscriptionAdminRoute');
const subscriptionCoachRouter = require('./src/subscriptionCoach/subscriptionCoachRoute');
const subscriptionParentRouter = require('./src/subscriptionParent/subscriptionParentRoute');
const paymentRouter = require('./src/studentPayments/studentPaymentRoute');
const messageRouter = require('./src/message/messageRoute');
const notificationAdminRouter = require('./src/notificationAdmin/notificationAdminRoute')
const notificationCoachRouter = require('./src/notificationCoach/notificationCoachRoute')
const notificationParentRouter = require('./src/notificationParent/notificationParentRoute')


const authRouter = require('./src/auth/authRoute');

const app = express();
app.use(compression());

// parse application/json
//app.use(bodyParser.json());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());





app.use(
  cors({
    origin: ['http://127.0.0.1:5173','http://localhost','http://localhost:5173','https://koralandacad.link'],
    credentials: true,
    withCredentials: true,
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
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

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
 app.use('/api/v1/refresh_admin', refreshAdminRouter);
 app.use('/api/v1/refresh_coach', refreshCoachRouter);
 app.use('/api/v1/refresh_parent', refreshParentRouter);
 app.use('/api/v1/auth', authRouter);
 app.use('/api/v1/historique_coach', historiqueCoachRouter);
 app.use('/api/v1/historique_parent', historiqueParentRouter);
 app.use('/api/v1/historique_student', historiqueStudentRouter);
 app.use('/api/v1/historique_groupe', historiqueGroupeRouter);
 app.use('/api/v1/historique_evaluation', historiqueEvaluationRouter);
 app.use('/api/v1/historique_presence', historiquePresenceRouter);
 app.use('/api/v1/payment', paymentRouter);
 app.use('/api/v1/message', messageRouter);
 app.use('/api/v1/subscription_admin', subscriptionAdminRouter);
 app.use('/api/v1/subscription_coach', subscriptionCoachRouter);
 app.use('/api/v1/subscription_parent', subscriptionParentRouter);
 app.use('/api/v1/notification_admin', notificationAdminRouter);
 app.use('/api/v1/notification_coach', notificationCoachRouter);
 app.use('/api/v1/notification_parent', notificationParentRouter);

 

// we might use pug as template engine later 
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find the ${req.originalUrl} on this server`, 404));
  });
  
app.use(globalErrorHandler);
  
  module.exports = app;
  