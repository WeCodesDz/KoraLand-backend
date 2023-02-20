const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueGroupe = require('./historiqueGroupeModel');

exports.getAllHistoriqueGroupe = catchAsync(async (req, res, next) => {
    const { saison,groupeName } = req.query;
    const historiqueGroupe = await HistoriqueGroupe.findOne({
        where:{
            saison: saison,
            groupeName: groupeName
        }
    });
    const groupeStudents = await historiqueGroupe.getStudent({
        saisonActuel: saison,
    });

    res.status(200).json({
        status: 'success',
    data: {
        ...historiqueGroupe,
        groupeStudents
    },
        });
});

// Path: src\historiqueGroupe\historiqueGroupeRoute.js