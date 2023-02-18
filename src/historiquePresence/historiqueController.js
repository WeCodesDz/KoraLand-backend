const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const HistoriqueEvaluation = require('./historiqueEvaluationModel');
const HistoriqueStudent = require('./historiqueStudentModel');
const HistoriquePresence = require('./historiquePresenceModel');

const filterByStudent = (queryParams) => {
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
      if (['prenomEleve', 'nomEleve','saison'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });
  
    return where;
  };

exports.getHistoriqueOfStudentBySaison = catchAsync(async(req,res,next)=>{
    const { nomEleve, prenomEleve,saison } = req.query;
  if (!nomEleve || !prenomEleve) {
    throw new AppError('you must provide Nom,Prenom in query params', 400);
  }
  if(!saison){
    throw new AppError('you must provide saison in query params', 400);
  }

  const student = {
    nomEleve: nomEleve.trim(),
    prenomEleve: prenomEleve.trim(),
    saison:saison.trim()
  };
  const where = filterByStudent(student);
    const historiqueStudent = await HistoriqueStudent.findAll({
      where,
      // include:{
      //   model:student,

      // }
    });   
    res.status(200).json({
        status: 'success',
        data: { historiqueStudent },
      });
});
