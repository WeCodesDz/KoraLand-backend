const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueEvaluation = require('../historiqueEvaluation/historiqueEvaluationModel');
const HistoriqueStudent = require('../historiqueStudent/historiqueStudentModel');
const HistoriquePresence = require('./historiquePresenceModel');


exports.getHistoriqueOfPresneceStudentBySaison = catchAsync(async(req,res,next)=>{
  const { nomEleve,prenomEleve,dateNaissance,saison } = req.body;
  const student = await HistoriqueStudent.findOne({
    where: {
      nomEleve: nomEleve,
      prenomEleve: prenomEleve,
      dateNaissance: dateNaissance,
      saisonActuel: saison,
    }
  });

  const historiquePresence = await student.getPresence({
    where: {
      saison: saison
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      ...student,
      historiquePresence
    }
  });
});
