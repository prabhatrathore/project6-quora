const express = require('express');

const router = express.Router();
const userController = require('../controller/userController');
//const productController = require('../controllers/productController')
const userAuth = require('../middleware/userAuth')
const questionController = require('../controller/questionController')
const answerController = require('../controller/answerController')
const validator  =require('../utils/validator')

// user routes 
router.post('/register',userController.createUser);
router.post('/login',  userController.loginUser);
router.get('/user/:userId/profile',userAuth.userAuth,userController.getUserById);
router.put('/user/:userId/profile',userAuth.userAuth,userController.updateUser);
//question routes
router.post('/question',userAuth.userAuth,questionController.createQuestion);
router.get('/questions',questionController.getQuestion);
router.get('/questions/:questionId',questionController.getQuestionById);
router.put('/questions/:questionId',userAuth.userAuth,questionController.updateQuestion);
router.delete('/questions/:questionId',userAuth.userAuth,questionController.deleteById);
// answer route createAnswer   deleteById
router.post('/answer',userAuth.userAuth,answerController.createAnswer);
router.get('/questions/:questionId/answer',answerController.getAnswer);
router.put('/answer/:answerId',userAuth.userAuth,answerController.updateAnswer);
router.delete('/answers/:answerId',userAuth.userAuth,answerController.deleteById)

module.exports = router;