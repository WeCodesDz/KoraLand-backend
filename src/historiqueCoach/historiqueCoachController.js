const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueCoach = require('../models/historiqueCoachModel');


exports.getAllHistoriqueCoach = catchAsync(async (req, res, next) => {
    const { username } = req.body;
    const historiqueCoach = await HistoriqueCoach.findOne({
        where:{
            username: username
        }
    });
    const coachGroups = await historiqueCoach.getGroups();

    res.status(200).json({
        status: 'success',
        count: historiqueCoach.length,
    data: {
      historiqueCoach,
      coachGroups
    },
    });
});