const express = require('express');
const router = express.Router();
const studentPaymentController = require('./studentPaymentController');
const authController = require('../auth/authController');

router.use(authController.protect, authController.role('admin'));

router
      .route('/student/:id')
      .post(studentPaymentController.createPayment)
      .get(studentPaymentController.getStudentPayments);

router
      .route('/:id')
        .get(studentPaymentController.getPaymentById)
        .patch(studentPaymentController.updatePayment)
        .delete(studentPaymentController.deletePayment);
module.exports = router;