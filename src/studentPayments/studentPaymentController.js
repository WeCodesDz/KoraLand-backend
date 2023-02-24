const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const StudentPayment = require('./studentPaymentModel');
const Student = require('../student/studentModel');

exports.createPayment = catchAsync(async (req, res, next) => {
    const {mantant, status , saisonActuel} = req.body;
    if(!mantant || !status || !saisonActuel){
        throw new AppError('Please provide mantant and status and saisonActuel', 400);
    }

    const payment = await StudentPayment.create({
        mantant,
        status,
        saisonActuel
    });
    const student = await Student.findByPk(req.params.id);
    if(!student){
        throw new AppError('No student found with that ID', 404);
    }
    await student.addPayment(payment);
    res.status(201).json({
        status: 'success',
        data: {
            payment,
        },
    });
});

exports.getStudentPayments = catchAsync(async (req, res, next) => {
    const {saisonActuel} = req.query;
    if(!saisonActuel){
        throw new AppError('Please provide saison of patments', 400);
    }
    const student = await Student.findByPk(req.params.id);
    if(!student){
        throw new AppError('No student found with that ID', 404);
    }
    const payments = await student.getPayments({
        where:{
            saisonActuel
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            payments,
        },
    });
});

exports.getPaymentById = catchAsync(async (req, res, next) => {
    const payment = await StudentPayment.findByPk(req.params.id);
    if(!payment){
        throw new AppError('No payment found with that ID', 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
            payment,
        },
    });
});

exports.updatePayment = catchAsync(async (req, res, next) => {
    const payment = await StudentPayment.findByPk(req.params.id);
    if(!payment){
        throw new AppError('No payment found with that ID', 404);
    }
    await payment.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            payment,
        },
    });
});

exports.deletePayment = catchAsync(async (req, res, next) => {
    const payment = await StudentPayment.findByPk(req.params.id);
    if(!payment){
        throw new AppError('No payment found with that ID', 404);
    }
    await payment.destroy();
    res.status(200).json({
        status: 'success',
    });
});