const express = require('express');
const app = express();
const cors = require('cors');
const validateCredentials = require('./utils/validateCredentials');
const db = require('./db')
const userModel = require('./models/userModel');
const arenaModel = require('./models/arenaModel');
const {encryptPass,decryptPass} = require('./utils/encryptDecryptPass');
const {generateToken, verifyToken} = require('./utils/token');
const cookieParser = require('cookie-parser');

app.use(cors({
    origin : 'https://codebox-1.netlify.app',
    credentials : true
}))


app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());


require('dotenv').config();
const PORT = process.env.PORT;

app.get('/',(req,res) => {
  return  res.send('Home');
})

app.post('/signup',async (req,res) => {
    const {name,email,password} = req.body;
    
   try{
    await validateCredentials({name,email,password,mode : 'signup'});
    const userExists = await userModel.findOne({email});
    if(userExists){
        return res.send({
            status : 400,
            message : 'User already exists'
        })
    } 
     const hashedPass = await encryptPass(password);
     const user = await userModel.create({
        name,email,password : hashedPass
     }) 
     
     return res.send({
        status : 201,
        message : 'User created successfully',
        data : user
      })
   }
   catch(error){
    return res.send({
        status : 400,
        message : 'Data related error',
        error
     })
   }
});

app.post('/login',async (req,res) => {
    const {email,password} = req.body;
    
   try{
    await validateCredentials({email,password,mode : 'login'})
    const userExists = await userModel.findOne({email});
    if(userExists){
    const isMatchedPass = decryptPass(password,userExists.password);
      if(isMatchedPass){
        await userModel.findOneAndUpdate({email},{isAuth : true});
            const token = generateToken(email);
            
            return res.send({
                status : 201,
                message : 'User logged in successfully',
                token
            })
        }
        else{
            return res.send({
                status : 400,
                message : 'Incorrect password'
                
            })
        }
      }
      else{
       return res.send({
            status : 400,
            message : 'Incorrect email'
        })
      }
   }
  catch(error){
     return res.send({
        status : 400,
        message : 'Data related error',
        error
     })
  }
})

app.post('/auth',async(req,res) => {
  const {userToken} = req.body;
  console.log(userToken);
  const decoded = await verifyToken(userToken);
  const userEmail = decoded.user;
  try{
     const user = await userModel.findOne({email : userEmail});
     if(user){
        return res.send({
            status : 200,
            message : 'User found'
        })
     }
     else{
        return res.send({
            status : 400,
            message : 'User not found'
        })
     }
  }
  catch(error){
    return res.send({
        status : 500,
        message : 'Internal server error',
        error
    })
  }
})

app.post('/dashboard',async (req,res) => {
    const {userToken} = req.body;
    const decoded = await verifyToken(userToken);
    const userEmail = decoded.user;
    try{
        const user = await userModel.findOne({email : userEmail});
        console.log(user);
        return res.send({
            status : 200,
            message : 'Welcome to your Dashboard',
            data : user
        })
    }
   catch(error){
    return res.send({
        status : 500,
        message : 'Internal server error',
        error
    })
   } 
})

app.post('/dashboard/delete-account',async (req,res) => {
    const {id} = req.body;
    // console.log(id);
    try{
        const user = await userModel.findByIdAndDelete({_id : id});
        return res.send({
            status : 204,
            message : 'User account deleted successfully'
        })
    }
    catch(error){
        return res.send({
            status : 500,
            message : 'Internal server error'
        })
    }
})


app.post('/dashboard/create-arena',async (req,res) => {
    const {arenaName,userToken} = req.body;
    try{
        
        await validateCredentials({name : arenaName,mode : 'Create'})
        console.log('this line');
        const decoded = await verifyToken(userToken);
        const email = decoded.user;
        
        const user = await userModel.findOne({email});
        const arenaExists = await arenaModel.findOne({$and : [{arenaName},{userId : user._id}]});
    
        if(arenaExists){
           return res.send({
                status : 400,
                message : 'Arena name already exists'
            })
        }
        const arena =  await arenaModel.create({arenaName,userId : user._id});
         console.log(arena)
        return res.send({
            status : 201,
            message : 'Arena created successfully',
            data : arena
        })

    }
    catch(error){
        return res.send({
            status : 400,
            error
        })
    }
})


app.get('/recent-arenas',async(req,res) => {
    const { authorization } = req.headers;
    const userToken = authorization.replace('Bearer ', '');
    const SKIP = parseInt(req.query.skip);
    const LIMIT = parseInt(req.query.limit);
   const decoded = await verifyToken(userToken);
   const email = decoded.user;
 try{
    const user = await userModel.findOne({email});
    const totalArenas = await arenaModel.find({userId : user._id});
    const recentArenasPortion = await arenaModel.find({userId : user._id})
    .skip(SKIP).limit(LIMIT).exec();
     if(!recentArenasPortion){
        return res.send({
            status : 404,
            message : 'No arenas developed'
        })
     }
     else{
        return res.send({
            status : 200,
            message : 'Found arenas',
            portion : recentArenasPortion,
             total : totalArenas
        })
     }
 }
 catch(error){
    return res.send({
        status : 500,
        message : 'Internal server error',
        error
    })
 }
})

app.post('/get-arena',async (req,res) => {
    const {id} = req.body;
    try{
    const arena = await arenaModel.findOne({_id : id});
    return res.send({
        status : 200,
        message : 'Arena found successfully',
        data : arena
    })
    }
    catch(error){
        return res.send({
            status : 500,
            message : 'Internal server error',
            error
        })
    }

})

app.post('/delete-arena',async (req,res) => {
    const {id} = req.body;
    try{
    const arena = await arenaModel.findOneAndDelete({_id : id});
    return res.send({
        status : 200,
        message : 'Arena deleted successfully',
    })
    }
    catch(error){
        return res.send({
            status : 500,
            message : 'Internal server error',
            error
        })
    }
})

app.post('/save-files',async (req,res) => {
   const {id,html,css,js} = req.body;
   try{
     const arena = await arenaModel.findByIdAndUpdate({_id : id},{
        html,css,js
     });
     return res.send({
        status : 201,
        message : 'Saved successfully'
     })
   }
   catch(error){
    return res.send({
        status : 500,
        message : 'Internal server error'
    })
   }
})
app.listen(PORT,() => {
    console.log(`Server running on port : ${PORT}`);
})