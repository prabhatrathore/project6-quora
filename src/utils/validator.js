const userModel = require('../model/userModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
};
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};
const isValidObjectId = function (objectId) {
    return ObjectId.isValid(objectId)
};
const validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const validNumber = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;

module.exports = { isValid, validEmail, validNumber, isValidObjectId, isValidRequestBody };