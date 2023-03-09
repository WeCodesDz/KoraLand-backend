const express = require('express');
const messageController = require('./messageController');
const authController = require('../auth/authController');

const router = express.Router();

// router.route('/').get(authController.protect,
//                       authController.role('admin','parent'),
//                       messageController.getAllMessagesByRoom);

// router.route('/discussions').get(authController.protect,
//                                  authController.role('admin'),
//                                  messageController.getAllDisscussions);

router.route('/create_discussion').post(authController.protect,
                                     authController.role('admin','parent'),
                                     messageController.createMessage);

router.route('/reply_discussion/:subjectId').post(authController.protect,                            
                                    authController.role('admin','parent'),
                                    messageController.replyMessage);

router.route('/get_discussion/:subjectId').get(authController.protect,
                                               authController.role('admin','parent'),
                                               messageController.getMessagesBySubjectId);

router.route('/get_parent_discussions/:parentId').get(authController.protect,
                                                        authController.role('admin','parent'),
                                                        messageController.getSubjectDistinctByParent);

router.route('/get_admin_discussions/:parentId').get(authController.protect,
                                                        authController.role('admin','parent'),
                                                        messageController.getSubjectDistinctByAdmin);
    
module.exports = router;