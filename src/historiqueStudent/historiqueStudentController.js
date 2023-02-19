const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueStudent = require('../models/historiqueStudentModel');

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
      if (['saison','nomEleve','prenomEleve'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });

    return where;
  };

const getAllHistoriqueStudentsBySaison = catchAsync(async (req, res, next) => {
    let { page, limit } = req.query;
    page = page * 1 || 1;
    limit = limit * 1 || 100;
    // offset is the number of rows skipped
    const offset = (page - 1) * limit;
    //filtering
    const where = filter(req.query);
    const historiqueStudents = await HistoriqueStudent.findAndCountAll({
        where,
        limit,
        offset,
    });
    
    res.status(200).json({
        status: 'success',
        rows: historiqueStudents.length,
    data: {
      totalPages: Math.ceil(historiqueStudents.count / limit),
      page,
      limit,
      rows: historiqueStudents.rows.length,
      totalHistoriques: historiqueStudents.rows,
    },
    });
});