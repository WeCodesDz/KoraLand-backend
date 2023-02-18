const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Evaluation = require('./evaluationModel');
const Student = require('../student/studentModel');
const historiqueEvaluation  = require('../historiqueEvaluation/historiqueEvaluationModel');
const HistoriqueStudent  = require('../historiqueStudent/historiqueStudentModel');
 
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
  const excludedFields = ['page', 'sort', 'limit', 'fields','order'];
  excludedFields.forEach((field) => delete queryObj[field]);


  const queryArray = Object.entries(queryObj);

  const where = {};

  queryArray.forEach((obj) => {
    if (['dateEvaluation','etatEvaluation','studentId'].includes(obj[0])) {
      where[obj[0]] = obj[1];
    }
  });
  return where;
};

exports.createStudentEvaluation = catchAsync(async (req, res, next) => {
  const {
    vitesse30m1,
    coordination1,
    souplesse1,
    endurance1,
    force1,
    vitesse30m2,
    coordination2,
    souplesse2,
    endurance2,
    force2,
    jonglerie,
    conduitDeBalleEnSlalom,
    qualiteDePasse,
    controleDeBalle,
    controleOrionte,
    precisionDeTir,
    passeCourte,
    passeLongue,
    dribble,
    conduiteDeBalle,
    piedFaible,
    jeuxDeTete,
    tackle,
    coupsFrancCourts,
    coupsFrancLongs,
    corners,
    confienceEnSoi,
    concentration,
    attitude,
    aggrisiveSaine,
    penalty,
    combativite,
    collectif,
    motivationPersonnelle,
    timidite,
    comportementOffensif,
    comportementDefensive,
    duel,
    inteligenceDansLeJeu,
    dateEvaluation,
  } = req.body; 

  if (!dateEvaluation){
    throw new AppError('Please provide a date for the evaluation', 400);
  }
  const student = await Student.findByPk(req.params.id.trim());
  if(!student){
    throw new AppError('No student found by this id',404);
  }
    const evaluation = await Evaluation.create({
        vitesse30m1,
        coordination1,
        souplesse1,
        endurance1,
        force1,
        vitesse30m2,
        coordination2,
        souplesse2,
        endurance2,
        force2,
        jonglerie,
        conduitDeBalleEnSlalom,
        qualiteDePasse,
        controleDeBalle,
        controleOrionte,
        precisionDeTir,
        passeCourte,
        passeLongue,
        dribble,
        penalty,
        conduiteDeBalle,
        piedFaible,
        jeuxDeTete,
        tackle,
        coupsFrancCourts,
        coupsFrancLongs,
        corners,
        confienceEnSoi,
        concentration,
        attitude,
        aggrisiveSaine,
        combativite,
        collectif,
        motivationPersonnelle,
        timidite,
        comportementOffensif,
        comportementDefensive,
        duel,
        inteligenceDansLeJeu,
        dateEvaluation
    });
    await student.addEvaluation(evaluation);
    res.status(201).json({
        status: 'success',
        data: {
        evaluation,
        },
    });
});

exports.getStudentEvaluationByDateEvaluation = catchAsync(async (req, res, next) => {

  const {dateEvaluation} = req.body;
  const student = await Student.findByPk(req.params.id);
  if(!student){
    throw new AppError('No student found with this id',404)
  }
  const evaluation = await Evaluation.findOne({
    where:{
      studentId:student.id,
      dateEvaluation:dateEvaluation
    }
  })
  const technique = {
    jonglerie : evaluation.get('jonglerie'),
    conduitDeBalleEnSlalom : evaluation.get('conduitDeBalleEnSlalom'),
    qualiteDePasse : evaluation.get('qualiteDePasse'),
    controleDeBalle : evaluation.get('controleDeBalle'),
    passeLongue : evaluation.get('passeLongue'),
    passeCourte : evaluation.get('passeCourte'),
    dribble : evaluation.get('dribble'),
    piedFaible : evaluation.get('piedFaible'),
    jeuxDeTete : evaluation.get('jeuxDeTete') 
  } 
  const physique = {
    vitesse30m1: evaluation.get('vitesse30m1'),
    coordination1: evaluation.get('coordination1'),
    souplesse1: evaluation.get('souplesse1'),
    endurance1: evaluation.get('endurance1'),
    force1: evaluation.get('force1'),
    vitesse30m2: evaluation.get('vitesse30m2'),
    coordination2: evaluation.get('coordination2'),
    souplesse2: evaluation.get('souplesse2'),
    endurance2: evaluation.get('endurance2'),
    force2: evaluation.get('force2')
  } 
  const mental = {
    confienceEnSoi : evaluation.get('confienceEnSoi'),
    concentration : evaluation.get('concentration'),
    attitude : evaluation.get('attitude'),
    aggrisiveSaine : evaluation.get('aggrisiveSaine'),
    combativite : evaluation.get('combativite'),
    collectif : evaluation.get('collectif'),
    motivationPersonnelle : evaluation.get('motivationPersonnelle'),
    timidite : evaluation.get('timidite') 
  }
  const tactique = {
    comportementOffensif : evaluation.get('comportementOffensif'),
    comportementDefensive : evaluation.get('comportementDefensive'),
    duel : evaluation.get('duel'),
    inteligenceDansLeJeu : evaluation.get('inteligenceDansLeJeu'),  
  }
  res.status(200).json({
    status:'status',
    data:{
      dateEvaluation,
      technique,
      mental,
      tactique,
      physique
    }
  });
});

exports.getStudentLastEvaluation = catchAsync(async (req, res, next) => {
    const student = await Student.findByPk(req.params.id);
    if(!student){
      throw new AppError('No student found with this id',404)
    }
    const evaluation = await Evaluation.findOne({
      where:{
        studentId:student.id
      },
      order: [
        ['createdAt', 'DESC']
      ]
    });
    res.status(200).json({
      status:'status',
      data:{
        evaluation
      }
    });
});

exports.getAllStudentEvaluation = catchAsync(async (req, res, next) => {
  let { page ,limit ,order } = req.query;
  page = page * 1 || 1;
  limit = limit * 1 || 1;
  // offset is the number of rows skipped
  const offset = (page - 1) * limit;
  //filtering
  const where = filter(req.query);

  const results = await Evaluation.findAndCountAll({
    where,
    limit,
    offset,
    order
  });
  res.status(200).json({
    status: 'success',
    rows: results.count,
    data: {
        totalEvaluations: Math.ceil(results.count / limit),
        page,
        limit,
        rows: results.rows.length,
        Evaluations: results.rows
    },
});
});

exports.handleEvaluation = catchAsync(async (req, res, next) => {

  const evaluation = await Evaluation.findByPk(req.params.id);
  if(!evaluation){
    throw new AppError('No evaluation found with this id',404)
  }
  const { etatEvaluation } = req.body;
  if(etatEvaluation) {
    evaluation.etatEvaluation = etatEvaluation;
    await evaluation.save();
  }
  const student = await Student.findByPk(evaluation.studentId);
  const historiqueStudent = await HistoriqueStudent.findOne({
    where:{
      nomEleve:student.nomEleve,
      prenomEleve:student.prenomEleve,
      dateNaissance:student.dateNaissance
    }
  });
  if(etatEvaluation === 'accepted') {
      const {
        vitesse30m1,
        coordination1,
        souplesse1,
        endurance1,
        force1,
        vitesse30m2,
        coordination2,
        souplesse2,
        endurance2,
        force2,
        jonglerie,
        conduitDeBalleEnSlalom,
        qualiteDePasse,
        controleDeBalle,
        controleOrionte,
        precisionDeTir,
        passeCourte,
        passeLongue,
        dribble,
        penalty,
        conduiteDeBalle,
        piedFaible,
        jeuxDeTete,
        tackle,
        coupsFrancCourts,
        coupsFrancLongs,
        corners,
        confienceEnSoi,
        concentration,
        attitude,
        aggrisiveSaine,
        combativite,
        collectif,
        motivationPersonnelle,
        timidite,
        comportementOffensif,
        comportementDefensive,
        duel,
        inteligenceDansLeJeu,
        dateEvaluation,
        etatEvaluation
      } = evaluation;
      await historiqueEvaluation.create({
        vitesse30m1,
        coordination1,
        souplesse1,
        endurance1,
        force1,
        vitesse30m2,
        coordination2,
        souplesse2,
        endurance2,
        force2,
        jonglerie,
        conduitDeBalleEnSlalom,
        qualiteDePasse,
        controleDeBalle,
        controleOrionte,
        precisionDeTir,
        passeCourte,
        passeLongue,
        dribble,
        penalty,
        conduiteDeBalle,
        piedFaible,
        jeuxDeTete,
        tackle,
        coupsFrancCourts,
        coupsFrancLongs,
        corners,
        confienceEnSoi,
        concentration,
        attitude,
        aggrisiveSaine,
        combativite,
        collectif,
        motivationPersonnelle,
        timidite,
        comportementOffensif,
        comportementDefensive,
        duel,
        inteligenceDansLeJeu,
        dateEvaluation,
        etatEvaluation,
          historiqueStudentId:historiqueStudent.id,
      });
  }
  if(etatEvaluation === 'blocked') {
    // HERE WE SHOULD SEND NOTIFICATION TO THE COACH
    console.log(req.user.username + ' ' + 'a refusé votre demande d\'évaluation')
  }
  res.status(200).json({
    status: 'success',
    data: {
      evaluation
    },
  });
});