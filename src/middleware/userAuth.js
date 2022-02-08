const jwt = require('jsonwebtoken')

// const userAuth = function (req, res, next) {
//     try {
//         let token = req.header('Authorization', 'Bearer Token')
//         if (!token) {
//             return res.status(401).send({ status: false, msg: "Missing authentication token" })
//         }
//         token = token.split(' ')
//         //console.log(token)
//         if (!(token[0] && token[1])) {
//             return res.status(401).send({ status: false, msg: "no authentication token" })
//         } else {

//             let decodeToken =  jwt.decode(token[1], 'project6')
//             if (decodeToken) {
//                 req.user = decodeToken.userId
//                 next()
//             } else {
//                 res.status(401).send({ status: false, msg: "not a valid token" })
//             }
//         }
//     } catch (err) {
//         console.log(err)
//         res.status(500).send({ status: false, msg: err.message })
//     }
// }




const userAuth = async (req, res, next) => {
   try {
        const authtoken = req.headers['authorization']//req.header('x-api-key')

        if (!authtoken)  return res.status(400).send({ status: false, msg: "token is required" })

        const bearerToken = authtoken.split(' ')

        const token = bearerToken[1]
        //console.log(token)
        // if (!token) {
        //     res.status(403).send({ status: false, message: `Missing authentication token in request` })
        //     return;
        // }
        const decoded = await jwt.verify(token, 'project6')
        // console.log(decoded)
        if (decoded) {
            req.user = decoded.userId;
            next()
        } else {
            res.status(403).send({ status: false, message: `Invalid authentication token in request` })
            return;
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports.userAuth = userAuth