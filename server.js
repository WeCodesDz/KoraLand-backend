const dotenv = require("dotenv");
const Sequelize = require("sequelize");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

process.on("uncaughtException", (err) => {
  console.error(err);
  console.log("Uncaught Exception");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const db = require("./database");
const port = process.env.PORT;

const Coach = require("./src/coach/coachModel");
const Admin = require("./src/admin/adminModel");
const Groupe = require("./src/groupe/groupeModel");
const Student = require("./src/student/studentModel");
const Evaluation = require("./src/evaluation/evaluationModel");
const Presence = require("./src/presence/presenceModel");
const Parent = require("./src/parent/parentModel");
const RefreshParent = require("./src/refreshParent/refreshParentModel");
const RefreshCoach = require("./src/refreshCoach/refreshCoachModel");
const RefreshAdmin = require("./src/refreshAdmin/refreshAdminModel");
const historiqueStudent = require("./src/historiqueStudent/historiqueStudentModel");
const historiqueGroupe = require("./src/historiqueGroupe/historiqueGroupeModel");
const historiqueEvaluation = require("./src/historiqueEvaluation/historiqueEvaluationModel");
const historiquePresence = require("./src/historiquePresence/historiquePresenceModel");
const historiqueCoach = require("./src/historiqueCoach/historiqueCoachModel");
const historiqueParent = require("./src/historiqueParent/historiqueParentModel");
const NotificationAdmin = require("./src/notificationAdmin/notificationAdminModel");
const NotificationCoach = require("./src/notificationCoach/notificationCoachModel");
const NotificationParent = require("./src/notificationParent/notificationParentModel")
const AdminSubscription = require("./src/subscriptionAdmin/subscriptionAdminModel");
const CoachSubscription = require("./src/subscriptionCoach/subscriptionCoachModel");
const ParentSubscription = require("./src/subscriptionParent/subscriptionParentModel");
const Payment = require("./src/studentPayments/studentPaymentModel");
const Message = require("./src/message/messageModel");

// Models
Groupe.hasMany(Student, { onDelete: "cascade" });
Student.belongsTo(Groupe, { onDelete: "cascade" });

Coach.hasMany(Groupe, { onDelete: "cascade" });
Groupe.belongsTo(Coach, { onDelete: "cascade" });

Student.hasMany(Evaluation, { onDelete: "cascade" });
Evaluation.belongsTo(Student, { onDelete: "cascade" });

Student.hasMany(Presence, { onDelete: "cascade" });
Presence.belongsTo(Student, { onDelete: "cascade" });

Student.hasMany(Payment, { onDelete: "cascade" });
Payment.belongsTo(Student, { onDelete: "cascade" });

Groupe.hasMany(Presence, { onDelete: "cascade" });
Presence.belongsTo(Groupe, { onDelete: "cascade" });

Parent.hasMany(Student, { onDelete: "cascade" });
Student.belongsTo(Parent, { onDelete: "cascade" });

//message associations
Parent.hasMany(Message, { as: "rooms", onDelete: "cascade" });
Message.belongsTo(Parent, { as: "rooms", onDelete: "cascade" });

Parent.hasMany(Message, { onDelete: "cascade" });
Message.belongsTo(Parent, { onDelete: "cascade" });

Admin.hasMany(Message, { onDelete: "cascade" });
Message.belongsTo(Parent, { onDelete: "cascade" });

// Refresh Models
Parent.hasMany(RefreshParent, { as: "refreshes", onDelete: "cascade" });
RefreshParent.belongsTo(Parent, { onDelete: "cascade" });

Coach.hasMany(RefreshCoach, { as: "refreshes", onDelete: "cascade" });
RefreshCoach.belongsTo(Coach, { onDelete: "cascade" });

Admin.hasMany(RefreshAdmin, { as: "refreshes", onDelete: "cascade" });
RefreshAdmin.belongsTo(Admin, { onDelete: "cascade" });
// Historique Models

historiqueGroupe.hasMany(historiqueStudent, {
  as: "student",
  onDelete: "cascade",
});
historiqueStudent.belongsTo(historiqueGroupe, { onDelete: "cascade" });

historiqueCoach.hasMany(historiqueGroupe, {
  as: "groupe",
  onDelete: "cascade",
});
historiqueGroupe.belongsTo(historiqueCoach, { onDelete: "cascade" });

historiqueStudent.hasMany(historiqueEvaluation, {
  as: "evaluation",
  onDelete: "cascade",
});
historiqueEvaluation.belongsTo(historiqueStudent, { onDelete: "cascade" });

historiqueStudent.hasMany(historiquePresence, {
  as: "presence",
  onDelete: "cascade",
});
historiquePresence.belongsTo(historiqueStudent, { onDelete: "cascade" });

historiqueGroupe.hasMany(historiquePresence, {
  as: "presence",
  onDelete: "cascade",
});
historiquePresence.belongsTo(historiqueGroupe, { onDelete: "cascade" });

historiqueParent.hasMany(historiqueStudent, {
  as: "student",
  onDelete: "cascade",
});
historiqueStudent.belongsTo(historiqueParent, { onDelete: "cascade" });

// Relations between USer models and their subscriptions models
Admin.belongsToMany(AdminSubscription, {
  as: "sub",
  through: "admin_subscriptions",
});
AdminSubscription.belongsToMany(Admin, {
  as: "sub",
  through: "admin_subscriptions",
});
Coach.belongsToMany(CoachSubscription, {
  as: "sub",
  through: "coach_subscriptions",
});
CoachSubscription.belongsToMany(Coach, {
  as: "sub",
  through: "coach_subscriptions",
});
Parent.belongsToMany(ParentSubscription, {
  as: "sub",
  through: "parent_subscriptions",
});
ParentSubscription.belongsToMany(Parent, {
  as: "sub",
  through: "parent_subscriptions",
});

// Relations between User models and their Notifications models
Admin.belongsToMany(NotificationAdmin, {
  
  through: "admin_notifications",
});
NotificationAdmin.belongsToMany(Admin, {
  
  through: "admin_notifications",
});
Coach.belongsToMany(NotificationCoach, {
  
  through: "coach_notifications",
});
NotificationCoach.belongsToMany(Coach, {
  
  through: "coach_notifications",
});
Parent.belongsToMany(NotificationParent, {
  
  through: "parent_notifications",
});
NotificationParent.belongsToMany(Parent, {
  
  through: "parent_notifications",
});

(async () => {
  await db.authenticate();
  //console.log('database connected');
  //Admin.sync({ force: true });
  //AdminSubscription.sync({ force: true });
   //db.sync({ force: true })
  //Message.sync({ force: true })
  // CoachSubscription.sync({ force: true })
  //Coach.sync({ force: true })
  // await Admin.create({
  //   nomAdmin: "admin",
  //   prenomAdmin: "admin",
  //   email: "contact@we-codes.com",
  //   username: "admin",
  //   password: "password1234",
  //   passwordConfirm: "password1234",
  //   role: "admin",
  //   adminLevel: "superadmin",
  // });
})();
const app = require("./app");

////////////

const server = app.listen(port, () => console.log(`Listening on ${port}`));
//const server = app.listen();

const io = require("socket.io")(server, {
  cors: {
    origin: ['http://127.0.0.1:5173','http://localhost','http://localhost:5173','https://koralandacad.link'],
    methods: ["GET", "POST"],
    // credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const payload = await promisify(jwt.verify)(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    socket.username = payload.UserInfo.username;
    next();
  } catch (err) {
    console.error(err);
  }
});

process.on("unhandledRejection", (err) => {
  console.error(err);
  console.log("Unhandled Rejection  ");
  server.close(() => {
    process.exit(1);
  });
});
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
