const validator = require('validator')

const validateCredentials = ({name,email,password,mode}) => {
   return new Promise((resolve,reject) => {
    if(mode === 'signup'){
    if(!name || !email || !password){
        reject('Missing Credentials');
    }
    if(name.length < 3 || name.length >20){
        reject('Name length should be 3-20')
    }
    if(typeof name !== 'string'){
        reject('Invalid Name format')
    }
    if(typeof email !== 'string'){
        reject('Invalid Email type')
    }
    if(typeof password !== 'string'){
        reject('Invalid Password format')
    }
    if(!validator.isEmail(email)){
        reject('Invalid Email format')
    }
    if(password.length < 6){
        reject('Password length should be greater than 5')
    }
}
    else if(mode === 'login'){
   
        if(!email || !password){
            reject('Missing Credentials');
        }
        if(typeof email !== 'string'){
            reject('Invalid Email type')
        }
        if(!validator.isEmail(email)){
            reject('Invalid Email format')
        }
        if(typeof password !== 'string'){
            reject('Invalid Password format')
        }
        if(password.length < 6){
            reject('Password length should be greater than 5')
        }
    }
    else{
        if(name.length < 5){
            reject('Arena name should have atleast 5 characters')
        }
    }
    resolve();
   })
}

module.exports = validateCredentials;