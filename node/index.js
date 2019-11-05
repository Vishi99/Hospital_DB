const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.use(express.json());
const port = process.env.port || 3000
app.use(express.static('../public'));

mongoose.connect(process.env.mongodbURI,{
    useNewUrlParser: true
})
.then(()=>{
    console.log("Successfull")
});

// const auth = require('./routes/auth');
// app.use('/auth', auth);
const User = require('./models/user')

app.post('/auth', async (req,res)=>{
    
    //console.log(req.body)
    try{
        const exists = await User.findOne({
            UserID: req.body.UserID,
            Password: req.body.Password,
            UserType: req.body.UserType
        });

        if(!exists) 
            return res.status(400).send("User doesn't Exist")

        else{
            //console.log("Successfull login")
            res.send(req.body);
        }
    }catch(error){
        res.send(error.message);
    }
});

app.listen(port,()=>{
console.log(`listening to port ${port}`)
});
