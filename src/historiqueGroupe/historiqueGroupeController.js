const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueGroupe = require('./historiqueGroupeModel');

exports.getAllHistoriqueGroupe = catchAsync(async (req, res, next) => {
    const { saisonActuel,groupeName } = req.query;
    console.log(saisonActuel,groupeName)
    const historiqueGroupe = await HistoriqueGroupe.findOne({
        where:{
            saisonActuel: saisonActuel,
            groupeName: groupeName
        }
    });
    const groupeStudents = await historiqueGroupe.getStudent({
        where:{
            saisonActuel: saisonActuel,
        }
    });
    res.status(200).json({
        status: 'success',
    data: {
        historiqueGroupe,
        groupeStudents
    },
        });
});

// Path: src\historiqueGroupe\historiqueGroupeRoute.js