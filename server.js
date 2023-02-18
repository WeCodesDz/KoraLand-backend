const dotenv = require('dotenv');
const Sequelize = require('sequelize');

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
const Presence = require('./src/presence/presenceModel');
const Parent = require('./src/parent/parentModel');
const RefreshParent = require('./src/refreshParent/refreshParentModel');
const RefreshCoach = require('./src/refreshCoach/refreshCoachModel');
const RefreshAdmin = require('./src/refreshAdmin/refreshAdminModel');
const historiqueStudent = require('./src/historiqueStudent/historiqueStudentModel');
const historiqueGroupe = require('./src/historiqueGroupe/historiqueGroupeModel');
const historiqueEvaluation = require('./src/historiqueEvaluation/historiqueEvaluationModel');
const historiquePresence = require('./src/historiquePresence/historiquePresenceModel');
const historiqueCoach = require('./src/historiqueCoach/historiqueCoachModel');
const historiqueParent = require('./src/historiqueParent/historiqueParentModel');


// Models
Groupe.hasMany(Student, { onDelete: 'cascade' });
Student.belongsTo(Groupe, { onDelete: 'cascade' });

Coach.hasMany(Groupe, { onDelete: 'cascade' });
Groupe.belongsTo(Coach, { onDelete: 'cascade' });

Student.hasMany(Evaluation, { onDelete: 'cascade'});
Evaluation.belongsTo(Student, {onDelete: 'cascade'});

 Student.hasMany(Presence, { onDelete: 'cascade'});
 Presence.belongsTo(Student, { onDelete: 'cascade'});

 Groupe.hasMany(Presence, { onDelete: 'cascade'});
 Presence.belongsTo(Groupe, { onDelete: 'cascade'});

Parent.hasMany(Student, { onDelete: 'cascade' });
Student.belongsTo(Parent, { onDelete: 'cascade' });
// Refresh Models
Parent.hasMany(RefreshParent, {as:'refreshes', onDelete: 'cascade' });
RefreshParent.belongsTo(Parent, { onDelete: 'cascade' });

Coach.hasMany(RefreshCoach, {as:'refreshes', onDelete: 'cascade' });
RefreshCoach.belongsTo(Coach, {onDelete: 'cascade' });

Admin.hasMany(RefreshAdmin, { as:'refreshes',onDelete: 'cascade' });
RefreshAdmin.belongsTo(Admin, { onDelete: 'cascade' });
// Historique Models

historiqueGroupe.hasMany(historiqueStudent, { onDelete: 'cascade' });
historiqueStudent.belongsTo(historiqueGroupe, { onDelete: 'cascade' });

historiqueCoach.hasMany(historiqueGroupe, { onDelete: 'cascade' });
historiqueGroupe.belongsTo(historiqueCoach, { onDelete: 'cascade' });

historiqueStudent.hasMany(historiqueEvaluation, { onDelete: 'cascade'});
historiqueEvaluation.belongsTo(historiqueStudent, {onDelete: 'cascade'});

 historiqueStudent.hasMany(historiquePresence, { onDelete: 'cascade'});
 historiquePresence.belongsTo(historiqueStudent, { onDelete: 'cascade'});

 historiqueGroupe.hasMany(historiquePresence, { onDelete: 'cascade'});
 historiquePresence.belongsTo(historiqueGroupe, { onDelete: 'cascade'});

historiqueParent.hasMany(historiqueStudent, { onDelete: 'cascade' });
historiqueStudent.belongsTo(historiqueParent, { onDelete: 'cascade' });
(async () => {
    await db.authenticate();
    console.log('database connected');
     db.sync({ force: true });
    //Parent.sync({ force: true });
    // await Admin.create({
    //     nomAdmin:'admin',
    //     prenomAdmin:'admin',
    //     email:'contact@we-codes.com',
    //     username:'admin',
    //     password:'password1234',
    //     passwordConfirm:'password1234',
    //     role:'admin',
    //     adminLevel:'superadmin'   
    // });
  })();
  const app = require('./app');
  
  ////////////
  
  //const server = app.listen(port, () => console.log(`Listening on ${port}`));
  const server = app.listen();
  
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
  