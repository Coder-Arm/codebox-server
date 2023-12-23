var jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

function generateToken(user){
const token = jwt.sign({user}, secretKey);
// console.log(token);
return token;
}

function verifyToken(token){
    return new Promise((resolve,reject) => {
   jwt.verify(token, secretKey,(err,decoded) => {
        if(err) reject(err);  
         else resolve(decoded);
    });
})
}

module.exports = {generateToken,verifyToken};