const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueStudent = require('./historiqueStudentModel');

const filter = (queryParams) => {
    const tempQueryParams = { ...queryParams };

    const keys = Object.keys(queryParams);
    keys.forEach((key) => {
      if (key !== key.trim()) {
        tempQueryParams[key.trim()] = tempQueryParams[key].trim();
        delete tempQueryParams[key];
      } else {
        tempQueryParams[key] = tempQueryParams[key].trim();
      }
    });

    const queryObj = { ...tempQueryParams };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    const queryArray = Object.entries(queryObj);

    const where = {};

    queryArray.forEach((obj) => {
      if (['saisonActuel','nomEleve','prenomEleve'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });

    return where;
  };

 exports.getAllHistoriqueStudentsBySaison = catchAsync(async (req, res, next) => {
    
    const where = filter(req.query);
    const historiqueStudents = await HistoriqueStudent.findOne({
        where
    });
      const evaluations = await historiqueStudents.getEvaluation();
      const presence = await historiqueStudents.getPresence();
    res.status(200).json({
        status: 'success',
        rows: historiqueStudents.length,
    data: {
        historique: historiqueStudents,
        presence,
        evaluations
    },
    });
});