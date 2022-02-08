const userModel = require('../model/userModel');
const questionModel = require('../model/questionModel');
const validator = require('../utils/validator');
const answerModel = require('../model/answerModel');

const createAnswer = async function (req, res) {
    try {
        const requestBody = req.body;
        TokenDetail = req.user
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
            return
        };
        let { answeredBy, text, questionId, } = requestBody;// Extract params   

        if (!(validator.isValidObjectId(answeredBy) && validator.isValid(answeredBy))) {
            return res.status(400).send({ stataus: false, msg: "invalid user id" })
        };
        if (!(validator.isValidObjectId(questionId) && validator.isValid(questionId))) {
            return res.status(400).send({ stataus: false, msg: "invalid question id" })
        };
        if (!(TokenDetail == answeredBy)) {
            return res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
        };

        if (!validator.isValid(text)) return res.status(400).send({ status: false, message: `text is required` });

        let questionFound = await questionModel.findOne({ _id: questionId, isDeleted: false });
        if (!questionFound) {
            return res.status(400).send({ status: false, msg: "question not found or deleted " })
        };
        if (!(answeredBy == questionFound.askedBy)) {
            await userModel.findOneAndUpdate({ _id: answeredBy }, { $inc: { creditScore: 200 } })
            const answerData = { answeredBy, text, questionId, };
            const newAnswer = await answerModel.create(answerData)//.sort({});
            return res.status(201).send({ status: true, message: ` answer created successfully`, data: newAnswer });

        } else {
            return res.status(400).send({ status: false, msg: "you are not authorise to give asnwer to your own question" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    };
};

const getAnswer = async function (req, res) {
    try {
        let questionId = req.params.questionId
        if (!(validator.isValid(questionId) && validator.isValidObjectId(questionId))) {
            return res.status(400).send({ status: false, message: "questionId is not valid" })
        }
        const getQuestions = await questionModel.findOne({ _id: questionId, isDeleted: false }).lean()
        if (!getQuestions) {
            res.status(404).send({ status: false, message: `Question not found` })
            return
        };
        // let questions = getQuestions.toObject()
        let answer = await answerModel.find({ questionId: questionId, isDeleted: false }).select({ text: 1, answeredBy: 1 }).sort({ createdAt: -1 })
        getQuestions.answers = answer
        return res.status(200).send({ status: true, message: "List of Question and Answer", data: getQuestions })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const updateAnswer = async (req, res) => {
    try {
        let answerId = req.params.answerId;
        const requestBody = req.body;
        TokenDetail = req.user
        if (!validator.isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, message: `${answerId} is not a valid answer id` })
        };
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide answer details' })
            return
        };
        const answerFound = await answerModel.findOne({ _id: answerId, isDeleted: false })
        if (!answerFound) {
            return res.status(404).send({ status: false, message: `answer Details not found with given answerId or deleted` })
        };
        let user = answerFound.answeredBy
        if (!(TokenDetail == user)) {
            return res.status(400).send({ status: false, message: "answerId in url param and in token is not same" })
        };
        let { text } = requestBody
        const updatedAnswerData = {}
        if (Object.prototype.hasOwnProperty.call(requestBody, 'text')) {
            if (!validator.isValid(text)) {
                return res.status(400).send({ status: false, message: `text is required` })
            };
            updatedAnswerData['text'] = text
        };
        const updateAnswer = { text }
        updateAnswer.UpdatedAt = new Date()
        const upatedAnswerOf = await answerModel.findOneAndUpdate({ _id: answerId }, updateAnswer, { new: true })
        res.status(200).send({ status: true, message: 'answer updated successfully', data: upatedAnswerOf });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
};
const deleteById = async function (req, res) {

    try {
        const requestBody = req.body
        const ansId = req.params.answerId
        const tokenId = req.user
        const userId = req.body.userId
        const questionId = req.body.questionId

        if (!validator.isValidObjectId(ansId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild answer ID" })
        };
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, Message: "Please provide body" })
        };
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide userId" })
        };
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild userId" })
        };
        if (!validator.isValid(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide questionId" })
        };
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, Message: "Please provide vaild questionId" })
        };
        const answer = await answerModel.findOne({ _id: ansId, isDeleted: false })
        // console.log(answer)
        if (!answer) {
            return res.status(404).send({ status: true, Message: "No answers found for this ID or deleted " })
        };
        if (!(questionId == answer.questionId)) {
            return res.status(400).send({ status: false, Message: "Provided answer is not of the provided question" })
        };
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, Message: "Unauthorized, You can't delete this answer " })
        };
        const deletedAns = await answerModel.findOneAndUpdate({ _id: ansId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return res.status(200).send({ status: true, msg: "Answer Deleted", data: deletedAns })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
module.exports = { createAnswer, getAnswer, updateAnswer, deleteById }