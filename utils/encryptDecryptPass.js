const bcrypt = require('bcryptjs');
require('dotenv').config()
const saltRounds = parseInt(process.env.SALT_ROUNDS);

async function encryptPass(password){
     const hashedPass = await bcrypt.hash(password, saltRounds);
    //  console.log(hashedPass)
    return hashedPass;
}

async function decryptPass(password,hashedPass){
    const isMatchedPass = await bcrypt.compare(password, hashedPass);
    return isMatchedPass
}

module.exports ={ encryptPass,decryptPass};
