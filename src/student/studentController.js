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
      if (['commune','anneeExamen','status1Tranche','status2Tranche','status'].includes(obj[0])) {
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

  if(req.user.adminLevel === 'superadmin') {
     results = await Student.findAndCountAll({
        attributes:[
            'id',
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
            'anneeExamen',
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
  if(req.user.adminLevel === 'level2') {
     results = await Student.findAndCountAll({
        attributes:[
            'id',
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
            'anneeExamen',
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
  if(req.user.adminLevel === 'level3') {
     results = await Student.findAndCountAll({
        attributes:[
            'id',
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'anneeExamen',
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
            totalPages: Math.ceil(results.count / limit),
            page,
            limit,
            rows: results.rows.length,
            totalStudents: results.rows
        },
    });

});

exports.getStudentById = catchAsync(async (req, res, next) => {
  let student;
  if(req.user.role === 'superadmin') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'id',
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
  if(req.user.role === 'level2') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'id',
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
  if(req.user.role === 'level3') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'id',
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

   if(nomEleve) student.nomEleve = nomEleve;
    if(prenomEleve) student.prenomEleve = prenomEleve;
    if(dateNaissance) student.dateNaissance = dateNaissance;
    if(saisonActuel) student.saisonActuel = saisonActuel;
    if(dateInscription) student.dateInscription = dateInscription;
    if(reinscription) student.reinscription = reinscription;
    if(mantant1Tranche) student.mantant1Tranche = mantant1Tranche;
    if(status1Tranche) student.status1Tranche = status1Tranche;
    if(mantant2Tranche) student.mantant2Tranche = mantant2Tranche;
    if(status2Tranche) student.status2Tranche = status2Tranche;
    if(numeroTelephone) student.status2Tranche = status2Tranche;
    if(anneExamen) student.anneExamen = anneExamen;
    if(commune) student.commune = commune;
    if(operateur) student.operateur = operateur;
    if(guardianDeBut) student.guardianDeBut = guardianDeBut;
    if(posteEleve) student.posteEleve = posteEleve;
    if(taille) student.taille = taille;
    if(poids) student.poids = poids;
    if(remarque) student.remarque = remarque;

  await student.save();
  
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