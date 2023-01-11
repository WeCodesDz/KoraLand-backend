const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Student = require('./studentModel');

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
      if (['categorieAge'].includes(obj[0])) {
        where[obj[0]] = obj[1];
      }
    });
    return where;
  };


exports.createStudent = catchAsync(async (req, res, next) => {
    const {
        nomEleve,
        prenomEleve,
        dateNaissance,
        saisonActuel,
        dateInscription,
        reinscription,
        mantant1Tranche,
        status1Tranche,
        mantant2Tranche,
        status2Tranche,
        numeroTelephone,
        anneExamen,
        commune,
        operateur,
        guardianDeBut,
        posteEleve,
        taille,
        poids,
        remarque
    } = req.body;
    
    const student = await Student.create({
        nomEleve,
        prenomEleve,
        dateNaissance,
        saisonActuel,
        dateInscription,
        reinscription,
        mantant1Tranche,
        status1Tranche,
        mantant2Tranche,
        status2Tranche,
        numeroTelephone,
        anneExamen,
        commune,
        operateur,
        guardianDeBut,
        posteEleve,
        taille,
        poids,
        remarque
    })

    res.status(201).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.getAllstudents = catchAsync( async(req,res,next)=>{
  let { page ,limit } = req.body;
  let results;
  page = page * 1 || 1;
  limit = limit * 1 || 1;
  // offset is the number of rows skipped
  const offset = (page - 1) * limit;
  //filtering
  const where = filter(req.query);
  if(req.admin.role === 'superAdmin') {
     results = await Student.findAndCountAll({
        attributes:[
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'mantant1Tranche',
            'status1Tranche',
            'mantant2Tranche',
            'status2Tranche',
            'numeroTelephone',
            'anneExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque'
        ],
        where,
        limit,
        offset
      });
  }
  if(req.admin.role === 'level2') {
    const results = await Student.findAndCountAll({
        attributes:[
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'mantant1Tranche',
            'status1Tranche',
            'mantant2Tranche',
            'status2Tranche',
            'anneExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque'
        ],
        where,
        limit,
        offset
      });
  }
  if(req.admin.role === 'level3') {
    const results = await Student.findAndCountAll({
        attributes:[
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'anneExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque'
        ],
        where,
        limit,
        offset
      });
  }
  
    res.status(200).json({
        status: 'success',
        rows: results.count,
        data: {
            totalStudents: results.rows,
            totalPages: Math.ceil(results.count / limit),
            page,
            limit,
            rows: results.rows.length,
            students: results.rows
        },
    });

});

exports.getStudentById = catchAsync(async (req, res, next) => {
  let student;
  if(req.admin.role === 'superAdmin') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'mantant1Tranche',
            'status1Tranche',
            'mantant2Tranche',
            'status2Tranche',
            'numeroTelephone',
            'anneExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque'
        ],
    });
  }
  if(req.admin.role === 'level2') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'mantant1Tranche',
            'status1Tranche',
            'mantant2Tranche',
            'status2Tranche',
            'anneExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque'
        ],
    });
  }
  if(req.admin.role === 'level3') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'anneExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque'
        ],
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      student
    },
});
});

exports.updateStudent = catchAsync(async (req, res, next) => {
  const {
    nomEleve,
    prenomEleve,
    dateNaissance,
    saisonActuel,
    dateInscription,
    reinscription,
    mantant1Tranche,
    status1Tranche,
    mantant2Tranche,
    status2Tranche,
    numeroTelephone,
    anneExamen,
    commune,
    operateur,
    guardianDeBut,
    posteEleve,
    taille,
    poids,
    remarque
} = req.body;

const student = await Student.findByPk(req.params.id.trim());
if(!student) {
    return new AppError('No student found with that ID', 404);
}
  await student.update({
    nomEleve,
    prenomEleve,
    dateNaissance,
    saisonActuel,
    dateInscription,
    reinscription,
    mantant1Tranche,
    status1Tranche,
    mantant2Tranche,
    status2Tranche,
    numeroTelephone,
    anneExamen,
    commune,
    operateur,
    guardianDeBut,
    posteEleve,
    taille,
    poids,
    remarque
  });

  res.status(200).json({
    status: 'success',
    data: {
      student
    },
});
});

exports.deleteStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findByPk(req.params.id.trim());
  if(!student) {
    return new AppError('No student found with that ID', 404);
  }
  await student.destroy();
  res.status(200).json({
    status: 'success',
    data: {
      student
    },
                      });
});