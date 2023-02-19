const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueGroupe = require('../models/historiqueGroupeModel');

exports.getAllHistoriqueGroupe = catchAsync(async (req, res, next) => {
    const { saison,groupeName } = req.body;
    const historiqueGroupe = await HistoriqueGroupe.findOne({
        where:{
            saison: saison,
            groupeName: groupeName
        }
    });
    const groupeStudents = await historiqueGroupe.getStudents({
        saison: saison,
    });

    res.status(200).json({
        status: 'success',
        count: historiqueGroupe.length,
    data: {
        historiqueGroupe,
        groupeStudents
    },
        });
});

// Path: src\historiqueGroupe\historiqueGroupeRoute.js