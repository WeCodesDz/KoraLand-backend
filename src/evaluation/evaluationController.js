const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Evaluation = require('./evaluationModel');
const Student = require('../student/studentModel');
 


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

