const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueCoach = require('./historiqueParentModel');

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
      if (['username','prenomParent','nomParent'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });

    return where;
  };

exports.getAllHistoriqueParent = catchAsync(async (req, res, next) => {
    const where = filter(req.query);
const parentHistorique = await HistoriqueCoach.findOne(where);
if (!parentHistorique) {
    return next(new AppError('No Historique found with this informations !', 404));
}
res.status(200).json({
    status: 'success',
    data: {
        parentHistorique,
    }
        });
});