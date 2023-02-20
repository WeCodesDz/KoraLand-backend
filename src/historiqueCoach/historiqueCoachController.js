const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueCoach = require('./historiqueCoachModel');


exports.getAllHistoriqueCoach = catchAsync(async (req, res, next) => {
    const { username } = req.query;
    const historiqueCoach = await HistoriqueCoach.findOne({
        attributes:['id','nomCoach','prenomCoach','email','username'],
        where:{
            username: username
        }
    });
    const coachGroups = await historiqueCoach.getGroupe({
        attributes:['id','groupeName','horaireEntrainement','categorieAge']
    });

    res.status(200).json({
        status: 'success',
        count: historiqueCoach.length,
    data: {
      historiqueCoach,
      coachGroups
    },
    });
});