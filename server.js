const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.error(err);
  console.log('Uncaught Exception');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const db = require('./database');
const port = process.env.PORT;

const Coach = require('./src/coach/coachModel');
const Admin = require('./src/administrateur/administrateurModel');
const Groupe = require('./src/groupe/groupeModel');
const Student = require('./src/student/studentModel');
const Evaluation = require('./src/evaluation/evaluationModel');

Groupe.hasMany(Student, { onDelete: 'cascade' });
Student.belongsTo(Groupe, { onDelete: 'cascade' });

Groupe.hasOne(Coach, { onDelete: 'cascade' });
Coach.belongsTo(Groupe, { onDelete: 'cascade' });

Student.hasMany(Evaluation, { onDelete: 'cascade'});
Evaluation.belongsTo(Student, {onDelete: 'cascade'});

(async () => {
    await db.authenticate();
    console.log('database connected');
    //db.sync({ force: true });
  
  })();
  const app = require('./app');
  
  
  
  const server = app.listen(port, () => console.log(`Listening on ${port}`));
  //const server = app.listen();
  
  process.on('unhandledRejection', (err) => {
    console.error(err);
    console.log('Unhandled Rejection  ');
    server.close(() => {
      process.exit(1);
    });
  });
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
  