const userModel = require('../model/userModel');
const jwt = require('jsonWebToken');
const bcrypt = require('bcrypt')
const validator = require('../utils/validator')

const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
            return
        };// Extract params     
        let { fname, lname, email, phone, password, creditScore } = requestBody;// Object destructing
        //  Validation starts
        if (!validator.isValid(fname)) return res.status(400).send({ status: false, message: `fname is required` });

        if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: `lname is required ` });

        if (!validator.isValid(email)) return res.status(400).send({ status: false, message: `Email is required` })

        email = email.trim().toLowerCase();
        if (!(validator.validEmail.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address ` })
            return
        };
        const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        };
        if (phone) {
            if (!validator.isValid(phone)) return res.status(400).send({ status: false, msg: "phone no is required" });
            if (!(validator.validNumber.test(phone))) return res.status(400).send({ status: false, message: `Please fill a valid phone number` })

            const isPhoneAlreadyUsed = await userModel.findOne({ phone }); //{phone: phone} object shorthand property
            if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
        };
        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        };
        if (!validator.isValid(creditScore)) {
            res.status(400).send({ status: false, message: `creditScore is required` })
            return
        };
        if (!(creditScore == '500')) {
            res.status(400).send({ status: false, message: `creditScore should be  500` })
            return
        };
        password = password.trim()
        if (!(password.length > 7 && password.length < 16)) {
            res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
            return
        };
        let salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        const userData = { fname, lname, phone, email, password, creditScore };
        const newUser = await userModel.create(userData);
        return res.status(201).send({ status: true, message: ` User created successfully`, data: newUser });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    };
};
const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "provide login credentials" })
        };
        let { email, password } = requestBody
        if (!validator.isValid(email)) {
            return res.status(401).send({ status: false, msg: "Email is required" })
        };
        email = email.toLowerCase().trim()
        if (!(validator.validEmail.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        };
        if (!validator.isValid(password)) {
            res.status(402).send({ status: false, msg: "password is required" })
            return
        };
        password = password.trim()
        let user = await userModel.findOne({ email: email });

        if (!user) return res.status(400).send({ status: false, msg: "no user found" })
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            res.status(403).send({ status: false, msg: "invalid email or password, try again with valid login credentials " })
            return
        };
        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),//issue date
            exp: Math.floor(Date.now() / 1000) + 300000 * 60//expire date 30*60 = 30min 
        }, 'project6');
        res.header('x-api-key', token);
        res.status(200).send({ status: true, msg: "User login successfull", data: { "userId": user._id, "token": token } });
        return
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
};
const getUserById = async function (req, res) {
    try {
        const userId = req.params.userId
        TokenDetail = req.user
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
        };
        if (!(TokenDetail == userId)) {
            return res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
        };
        const user = await userModel.findById({ _id: userId });
        if (!user) {
            return res.status(404).send({ status: false, message: `user does not exist` })
        };
        return res.status(200).send({ status: true, message: 'User profile details', data: user })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


const updateUser = async (req, res) => {
    try {
        userId = req.params.userId;
        const requestBody = req.body;
        TokenDetail = req.user
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
        };
        if (TokenDetail != userId) {
            return res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
        };
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified' })
        };
        const UserFound = await userModel.findOne({ _id: userId });
        if (!UserFound) {
            return res.status(404).send({ status: false, message: `User not found with given UserId` })
        };
        const { fname, lname, email, phone } = requestBody
        const filter = {}
        if (validator.isValid(fname)) {
            filter['fname'] = fname.trim()
        }
        if (validator.isValid(lname)) {
            filter['lname'] = lname.trim()
        }
        if (Object.prototype.hasOwnProperty.call(requestBody, 'email')) {
            if (!validator.isValid(email)) return res.status(400).send({ status: false, msg: "email is required" })
            if (!(validator.validEmail.test(email))) {
                res.status(400).send({ status: false, message: `Email should be a valid email address` })
                return
            };
            const isEmailAlreadyUsed = await userModel.findOne({ email: requestBody.email });
            if (isEmailAlreadyUsed) {
                res.status(400).send({ status: false, message: `${requestBody.email} email address is already registered` })
                return
            };
            filter['email'] = email.trim()
        };
        if (Object.prototype.hasOwnProperty.call(requestBody, 'phone')) {
            if (!validator.isValid(phone)) return res.status(400).send({ status: false, msg: "phone no is required" })
            if (!(validator.validNumber.test(phone))) {
                res.status(400).send({ status: false, message: `phone should be a valid phone no.` })
                return
            };
            const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
            if (isPhoneAlreadyUsed) {
                res.status(400).send({ status: false, message: `${phone} this phone no. is already registered` })
                return
            };
            filter['phone'] = phone.trim()
        };
        const updateUserDetails = await userModel.findOneAndUpdate({ _id: userId }, filter, { new: true })
        return res.status(200).send({ status: true, message: "Updated User Details", data: updateUserDetails })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
};
module.exports = { createUser, loginUser, getUserById, updateUser }
