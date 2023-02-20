const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueEvaluation = require('./historiqueEvaluationModel');
const HistoriqueStudent = require('../historiqueStudent/historiqueStudentModel');

exports.getHistoriqueOfEvaluationStudentBySaison = catchAsync(async(req,res,next)=>{
    const { nomEleve,prenomEleve,dateNaissance,saison } = req.body;
    const student = await HistoriqueStudent.findOne({
        where: {
        nomEleve: nomEleve,
        prenomEleve: prenomEleve,
        dateNaissance: dateNaissance,
        saisonActuel: saison,
        }
    });
    
    // const historiqueEvaluation = await student.getEvaluation({
    //     where: {
    //     saison: saison
    //     }
    // });
    
    res.status(200).json({
        status: 'success',
        data: {
        ...student,
        // historiqueEvaluation
        }
    });
});