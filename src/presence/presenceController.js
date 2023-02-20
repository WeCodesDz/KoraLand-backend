const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Presence = require('./presenceModel');
const Student = require('../student/studentModel');
const Groupe = require('../groupe/groupeModel');
const HistoriquePresence = require('../historiquePresence/historiquePresenceModel');
const HistoriqueGroupe = require('../historiqueGroupe/historiqueGroupeModel');
const HistoriqueStudent = require('../historiqueStudent/historiqueStudentModel');

exports.createPresence = catchAsync(async (req, res, next) => {
    const { studentId, groupeId, datePresence , presence } = req.body;

    const groupe = await Groupe.findByPk(groupeId,{
        attributes:['id','groupeName']
    });
    if(!groupe){
        throw new AppError('No groupe found with this id', 404);
    }

    const student = await Student.findByPk(studentId,{
        attributes:['id','nomEleve','prenomEleve','dateNaissance']
    });
    if(!student){
        throw new AppError('No student found with this id', 404);
    }

    const historiqueGroupe = await HistoriqueGroupe.findOne({
        where:{
            groupeName:groupe.groupeName,
        }
    });
    const historiqueStudent = await HistoriqueStudent.findOne({
        where:{
            nomEleve:student.nomEleve,
            prenomEleve:student.prenomEleve,
            dateNaissance:student.dateNaissance
        }
    });
    const presnece = await Presence.create({
        studentId,
        groupeId,
        datePresence,
        presence
    });

    await HistoriquePresence.create({
        historiqueStudentId:historiqueStudent.id,
        historiqueGroupeId:historiqueGroupe.id,
        datePresence,
        presence
    });

    res.status(200).json({
        status: 'success',
        data:{
            groupe,
            student,
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
    console.log("isStudents",isStudents);
    console.log("uniqueGroupeStudents",uniqueGroupeStudents);
    console.log("uniqueStudents",uniqueStudents);
    if(!isStudents){
        throw new AppError('Some students are not in this groupe', 404);
    }
    
    const presnece = await Presence.bulkCreate(groupeStudents.map(student => ({
        studentId: student.id,
        groupeId: groupe.id,
        datePresence,
        presence: students.find((s) => s.id === student.id).presence,
    })));
    
    const historiqueGroupe = await HistoriqueGroupe.findOne({
        where:{
            groupeName:groupe.groupeName,
        },
        include:{
            model:HistoriqueStudent,
            as:'student',
            attributes:['id'],
        },
    })
    
    const plainHistoriqueGroupe = {...historiqueGroupe.get({plain:true})};
    const historiqueStudents = [...plainHistoriqueGroupe.student    ];
    const uniqueHistoriqueStudents = [...new Set(historiqueStudents.map((vi) => vi.id))];


    const isHistoriqueStudents =  uniqueHistoriqueStudents.every((el) => {return uniqueStudents.includes(el)})
    if(!isHistoriqueStudents){
        throw new AppError('Some students are not in this groupe', 404);
    }

    await HistoriquePresence.bulkCreate(historiqueStudents.map(student => ({
        historiqueStudentId: student.id,
        historiqueGroupeId: historiqueGroupe.id,
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