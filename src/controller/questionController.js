const userModel = require('../model/userModel');
const questionModel = require('../model/questionModel')
const validator = require('../utils/validator');
const answerModel = require('../model/answerModel');


const createQuestion = async function (req, res) {
    try {
        const requestBody = req.body;
        TokenDetail = req.user
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide question details' })
            return
        };// Extract params   
        let { description, tag, userId, } = requestBody;

        if (!(validator.isValidObjectId(userId) && validator.isValid(userId))) {
            return res.status(400).send({ stataus: false, msg: "invalid user id" })
        };
        if (!(TokenDetail == userId)) {
            return res.status(400).send({ status: false, message: "userId in requestbody and in token is not same" })
        };  //  Validation starts
        if (!validator.isValid(description)) return res.status(400).send({ status: false, message: `description is required` });

        if (tag) {
            if (!validator.isValid(tag)) return res.status(400).send({ status: false, message: `tag is required ` });

        };
        let user = await userModel.findOne({ _id: userId });
        let askedBy = user._id;
        let rewardScore = user.creditScore;
        if (rewardScore >= 100) {
            const questionData = { description, tag, askedBy };
            await userModel.findOneAndUpdate({ _id: userId }, { $inc: { creditScore: -100 } })
            const newQuestion = await questionModel.create(questionData);

            return res.status(201).send({ status: true, message: ` User created successfully`, data: newQuestion });

        } else {
            return res.status(400).send({ status: false, msg: ` don't have the creditScore get some` })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    };
};

const getQuestion = async function (req, res) {
    try {
        let query = req.query
        let { tag, Sort } = query
        let filter = { isDeleted: false }
        if (validator.isValid(tag)) {
            const tagArr = tag.split(',')
            filter['tag'] = { $all: tagArr }
        };
        if (Sort) {
            if (!(Sort == 'descending' || Sort == 'ascending')) {
                return res.status(400).send({ status: false, message: ' Please provide Sort value descending || ascending ' })
            }
        };
        let QuestionsOfQuery = await questionModel.find(filter).lean().sort({ createdAt: Sort })
        for (let i = 0; i < QuestionsOfQuery.length; i++) {
            let answer = await answerModel.find({ questionId: QuestionsOfQuery[i]._id }).select({ text: 1, answeredBy: 1, createdAt: 1 }).sort({ createdAt: -1 })
            QuestionsOfQuery[i].answers = answer
        };
        if (Array.isArray(QuestionsOfQuery) && QuestionsOfQuery.length === 0) {
            return res.status(404).send({ status: false, message: 'No questions found' })
        };
        return res.status(200).send({ status: true, message: 'Questions list', data: QuestionsOfQuery })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const getQuestionById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid question id` })
        };
        let question = await questionModel.findOne({ _id: questionId, isDeleted: false });
        if (!question) {
            return res.status(404).send({ status: false, message: `question  not found or deleted` })
        };
        question = question.toObject()
        let answer = await answerModel.find({ questionId: questionId })
            .select({ text: 1, answeredBy: 1, createdAt: 1 }).sort({ createdAt: -1 })
        question.answers = answer

        return res.status(200).send({ status: true, message: 'Success', data: question })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
const updateQuestion = async (req, res) => {
    try {
        let questionId = req.params.questionId;
        const requestBody = req.body;
        TokenDetail = req.user
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid question id` })
        };
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide question details' })
            return
        };
        const questionFound = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!questionFound) {
            return res.status(404).send({ status: false, message: `question Details not found or deleted ` })
        };
        let user = questionFound.askedBy
        if (!(TokenDetail == user)) {
            return res.status(400).send({ status: false, message: "questionId in url param and in token is not same" })
        };
        let { description, tag } = requestBody
        const updatedQuestionData = {}
        if (Object.prototype.hasOwnProperty.call(requestBody, 'description')) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, message: `description is required` })
            };
            updatedQuestionData['description'] = description
        };
        if (Object.prototype.hasOwnProperty.call(requestBody, 'tag')) {
            if (!validator.isValid(tag)) {
                return res.status(400).send({ status: false, message: `tag is required` })
            };
            updatedQuestionData['tag'] = tag
        }
        const updateQuestion = { description, tag, }
        updateQuestion.UpdatedAt = Date()

        const upatedQuestionOf = await questionModel.findOneAndUpdate({ _id: questionId }, updateQuestion, { new: true })
        res.status(200).send({ status: true, message: 'Question updated successfully', data: upatedQuestionOf });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const deleteById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        if (!(validator.isValid(questionId) && validator.isValidObjectId(questionId))) {
            return res.status(404).send({ status: false, message: "questionId is not valid" })
        }
        const tokenUserId = req.user

        if (!validator.isValidObjectId(questionId) && !validator.isValidObjectId(tokenUserId)) {
            return res.status(404).send({ status: false, message: "questionId or token is not valid" })
        }
        const question = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!question) {
            res.status(404).send({ status: false, message: `question not found` })
            return
        }
        let user = question.askedBy
        if (!(tokenUserId == user)) {
            return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        }
        const deletedQuestion = await questionModel.findOneAndUpdate({ _id: questionId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (deletedQuestion) {
            res.status(200).send({ status: true, msg: "The question has been succesfully deleted" })
            return
        }
        res.status(404).send({ status: false, message: `Question already deleted not found` })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createQuestion, getQuestion, getQuestionById, updateQuestion, deleteById }