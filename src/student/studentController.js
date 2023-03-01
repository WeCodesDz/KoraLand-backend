const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Student = require('./studentModel');
const Presence = require('../presence/presenceModel');
const Evaluation = require('../evaluation/evaluationModel');
const Groupe = require('../groupe/groupeModel');
const HistoriqueParent = require('../historiqueParent/historiqueParentModel');
const HistoriqueGroupe = require('../historiqueGroupe/historiqueGroupeModel');
const HistoriqueStudent = require('../historiqueStudent/historiqueStudentModel');

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
      if (['commune','anneeExamen','status1Tranche','status2Tranche','status','sport'].includes(obj[0])) {
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
        numeroTelephone,
        anneeExamen,
        commune,
        guardianDeBut,
        posteEleve,
        taille,
        poids,
        remarque,
        parentId,
        groupeId,
        sport
    } = req.body;
    const adminName = req.user.nomAdmin+' '+req.user.prenomAdmin;
    const student = await Student.create({
        nomEleve,
        prenomEleve,
        dateNaissance,
        saisonActuel,
        dateInscription,
        reinscription,
        numeroTelephone,
        anneeExamen,
        commune,
        operateur:adminName,
        guardianDeBut,
        posteEleve,
        taille,
        poids,
        remarque,
        sport
    })
    await student.setParent(parentId);
    await student.setGroupe(groupeId);

    const parent = await student.getParent();
    const historiqueParent = await HistoriqueParent.findOne({
        where: { username: parent.username },
    })
    const groupe = await student.getGroupe();
    const historiqueGroupe = await HistoriqueGroupe.findOne({
        where: { groupeName: groupe.groupeName },
    });
    await HistoriqueStudent.create({
      id: student.id,
        nomEleve,
        prenomEleve,
        dateNaissance,
        saisonActuel,
        dateInscription,
        reinscription,
        numeroTelephone,
        anneeExamen,
        commune,
        operateur:adminName,
        guardianDeBut,
        posteEleve,
        taille,
        poids,
        remarque,
        sport,
        historiqueGroupeId: historiqueGroupe.id,
        historiqueParentId: historiqueParent.id
    });


    //send notification to super Admin
    //send push //       //  //    //


    res.status(201).json({
        status: 'success',
        data: {
            student,
        },
    });
});

exports.getAllstudents = catchAsync( async(req,res,next)=>{
  let { page ,limit } = req.query;
  let results;
  page = page * 1 || 1;
  limit = limit * 1 || 100;
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
            'sport',
            'numeroTelephone',
            'anneeExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque',
            'status'
        ],
        where,
        limit,
        offset,
        include: [
          {
            model: Groupe,
            attributes: ['groupeName','saisonActuel','horaireEntrainement', 'sport',],
          }
        ]
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
            'sport',
            'anneeExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque',
            'status'
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
            'sport',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque',
            'status'
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
  let parent;
  let groupe;
  if(req.user.adminLevel === 'superadmin') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'id',
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'sport',
            'numeroTelephone',
            'anneeExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque',
            'groupeId',
            'parentId'
        ],
    });
    parent = await student.getParent({
      attributes:['username','prenomParent','nomParent','numeroTelephone','status']
    });
   groupe = await student.getGroupe({
      attributes:['groupeName','horaireEntrainement','sport','categorieAge','saisonActuel']
   });
  }
  if(req.user.adminLevel === 'level2') {
     student = await Student.findByPk(req.params.id.trim(),{
        attributes:[
            'id',
            'nomEleve',
            'prenomEleve',
            'dateNaissance',
            'saisonActuel',
            'dateInscription',
            'reinscription',
            'sport',
            'anneeExamen',
            'commune',
            'operateur',
            'guardianDeBut',
            'posteEleve',
            'taille',
            'poids',
            'remarque',
            'groupeId',
            'parentId'
        ],
    });
    parent = await student.getParent({
      attributes:['username','prenomParent','nomParent','status']
    });
   groupe = await student.getGroupe({
      attributes:['groupeName','horaireEntrainement','sport','categorieAge','saisonActuel']
   });
  }
  if(req.user.adminLevel === 'level3') {
     student = await Student.findByPk(req.params.id.trim(),{
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
            'remarque',
            'groupeId',
            'parentId'
        ],
    });
    parent = await student.getParent({
      attributes:['username','prenomParent','nomParent','numeroTelephone','status']
    });
   groupe = await student.getGroupe({
      attributes:['groupeName','horaireEntrainement','sport','categorieAge','saisonActuel']
   });
  }
  student.groupeId = undefined;
  student.parentId = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      ...student.dataValues,
      parent,
      groupe

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
    
    numeroTelephone,
    anneeExamen,
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
    throw new  AppError('No student found with that ID', 404);
}

   if(nomEleve) student.nomEleve = nomEleve;
    if(prenomEleve) student.prenomEleve = prenomEleve;
    if(dateNaissance) student.dateNaissance = dateNaissance;
    if(saisonActuel) student.saisonActuel = saisonActuel;
    if(dateInscription) student.dateInscription = dateInscription;
    if(reinscription) student.reinscription = reinscription;
    
    if(numeroTelephone) student.status2Tranche = status2Tranche;
    if(anneeExamen) student.anneeExamen = req.body.anneeExamen;
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
    throw new  AppError('No student found with that ID', 404);
  }
  await student.destroy();
  res.status(200).json({
    status: 'success',
    data: {
      student
    },
                      });
});

exports.getBlockedStudents = catchAsync(async (req,res,next)=>{
  let { page ,limit } = req.query;
  let results;
  page = page * 1 || 1;
  limit = limit * 1 || 1;
  // offset is the number of rows skipped
  const offset = (page - 1) * limit;

  const where = {
    status: 'inactif'
  }

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
       where:{
        status: 'inactif'
       },
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

    if(!results) {
      throw new AppError('No in Actif students found', 404);
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

exports.blockStudent = catchAsync( async(req,res,next)=>{
    const student = await Student.findByPk(req.params.id)
    if(!student){
      throw new AppError('there is no student with this ID',404)
    }
    const {status} = req.body;
    if(status) student.status = status
    await student.save();
    res.status(200).json({
      status:'succes'
    })
})

exports.getStudentEvaluation = catchAsync(async (req,res,next)=>{
  const student = await Student.findByPk(req.params.id.trim());
  if(!student) {
    throw new  AppError('No student found with that ID', 404);
  }
  const evaluations = await student.getEvaluations();
  
  res.status(200).json({
    status: 'success',
    data: {
      ...student,
      evaluations
    },
  });
});

exports.getStudentPresenceByDate = catchAsync(async(req,res,next)=>{
   const {datePresence} = req.query;
  const student = await Student.findByPk(req.params.id.trim());
  if(!student) {
    throw new  AppError('No student found with that ID', 404);
  }
  const presences = await student.getPresences({
    where:{
      datePresence
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      presences
    },
  }); 
});

exports.lastEvaluation = catchAsync(async (req,res,next)=>{
  const student = await Student.findByPk(req.params.id.trim());
  if(!student) {
    throw new AppError('No student found with that ID', 404);
  }
  const lastEvaluation = await Evaluation.findAll({
    where: { 'studentId' : student.id },
    order: [ [ 'createdAt', 'DESC' ]],
    limit: 2
  });

  if(!lastEvaluation){
    throw new AppError('Last presence not found ',404)
  }

  res.status(200).json({
    status:'succes',
    data:{
      lastEvaluation
    }
  });
});

// exports.getStudentPayment = catchAsync(async(req,res,next) =>{
//   const {saison} = req.body;  
//   const student = await Student.findOne({
//     attributes:['mantant1Tranche','mantant2Tranche','status1Tranche','status2Tranche'],
//     where:{
//       saisonActuel : saison,
//       id:req.params.id.trim()
//     }
//   });
//   if(!student){
//     throw new AppError('no payment data found by this id on this saison',404); 
//   }

//   res.status(200).json({
//     status:'succes',
//     data:{
//       student
//     }
//   })
// })

// exports.updateStudentPayment = catchAsync(async(req,res,next)=>{
//   const {mantant1Tranche,mantant2Tranche,status1Tranche,status2Tranche} = req.body
//   const student = await Student.findByPk(req.params.id.trim());
//   if(!student){
//     throw new AppError('there is no student found with this id');
//   }
//   if(mantant1Tranche) student.mantant1Tranche = mantant1Tranche;
//   if(mantant2Tranche) student.mantant2Tranche = mantant2Tranche;
//   if(status1Tranche) student.status1Tranche = status1Tranche;
//   if(status2Tranche) student.status2Tranche = status2Tranche;

//   await student.save();
//   res.status(200).json({
//     status:'succes',
//     data:{
//       student
//     }
//   })
// })

exports.getStudentAllPresence = catchAsync(async(req,res,next)=>{
  const student = await Student.findByPk(req.params.id.trim());
  if(!student) {
    throw new  AppError('No student found with that ID', 404);
  }
  const presences = await student.getPresences();
  
  res.status(200).json({
    status: 'success',
    data: {
      presences
    },
  }); 
});