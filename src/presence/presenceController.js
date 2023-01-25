const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Presence = require('./presenceModel');
const Student = require('../student/studentModel');
const Groupe = require('../groupe/groupeModel');


exports.createPresence = catchAsync(async (req, res, next) => {
    const { studentId, groupeId, datePresence , presence } = req.body;

    const groupe = await Groupe.findByPk(groupeId);
    if(!groupe){
        throw new AppError('No groupe found with this id', 404);
    }

    const student = await Student.findByPk(studentId);
    if(!student){
        throw new AppError('No student found with this id', 404);
    }

    
    const presnece = await Presence.create({
        studentId,
        groupeId,
        datePresence,
        presence
    });

    res.status(200).json({
        status: 'success',
        data:{
            ...groupe,
            ...student,
            presnece
        }
    });

});

exports.createBulkPresence = catchAsync(async (req, res, next) => {
    const { datePresence , students } = req.body;

    const groupe = await Groupe.findOne({
        where:{
            id:req.params.id.trim()
        },
        include:{
            model:Student,
            attributes:['id'],
        },
    });
    if(!groupe){
        throw new AppError('No groupe found with this id', 404);
    }
    const plainGroupe = {...groupe.get({plain:true})};
    // const groupeStudents = await groupe.getStudents({
    //     attributes: ['id'],
    // },{
    //     plain:true,
    // }
    // );
    const groupeStudents = [...plainGroupe.students];
    if(!groupeStudents){
        throw new AppError('No students found in this groupe', 404);
    }

    const uniqueGroupeStudents = [...new Set(groupeStudents.map((vi) => vi.id))];
    const uniqueStudents = [...new Set(students.map((vi) => vi.id))];
    const isStudents =  uniqueGroupeStudents.every((el) => {return uniqueStudents.includes(el)})

    if(!isStudents){
        throw new AppError('Some students are not in this groupe', 404);
    }
    
    const presnece = await Presence.bulkCreate(groupeStudents.map(student => ({
        studentId: student.id,
        groupeId: groupe.id,
        datePresence,
        presence: students.find((s) => s.id === student.id).presence,
    })));


    res.status(200).json({
        status: 'success',
        data:{
            groupe,
            presnece
        }
    });
  
});