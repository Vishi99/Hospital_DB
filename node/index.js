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

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql@102',
  database: 'Hospital'
})
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MYSQL!");
});


var userid = ""

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
            userid = req.body.UserID;
            res.send(req.body);
        }
    }catch(error){
        res.send(error.message);
    }
});

const review = require('./models/review')
app.post('/review', async (req, res) => {

    try{
        const exists = await review.findOne({
            patient_id: req.body.patient_id
        })

        if(exists){
            await review.remove({
                patient_id: req.body.patient_id
            })
        }

        const rev = new review({
            patient_id: req.body.patient_id,
            review: req.body.review
        });
        await rev.save();
        //console.log(rev);
        res.send(rev);
    }catch(error){
        res.send(error.message);
    }
});

app.post('/billpay', async(req, res) => {
    try{
        //const pid = req.body.patient_id;
        const querry1 = "DELETE FROM bill WHERE P_id ='".concat(userid, "'");
        connection.query(querry1, function (err, result) {
            if (err) throw err;
            res.send(result);
          });
    }catch(error){
        res.send(error.message);
    }
})

app.get('/p_details', async (req, res) => {
    try{
        const querry = "SELECT * FROM patient WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    }catch(error){
        res.send(error.message);
    }
})

app.get('/p_record', async (req, res) => {
    try{
        const querry = "SELECT Illness, Medicines FROM p_records WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    }catch(error){
        res.send(error.message);
    }
})

app.get('/p_appoint', async (req, res) => {
    try{
        const querry = "SELECT Date, Time, D_Id  FROM appointment WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    }catch(error){
        res.send(error.message);
    }
})

app.get('/p_proced', async (req, res) => {
    try{
        const querry = "SELECT Date, Time, Name  FROM procedure_at WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    }catch(error){
        res.send(error.message);
    }
})

app.get('/p_bill', async (req, res) => {
    try{
        const querry = "SELECT No_of_Procedures, Total_Cost, Date_of_Payment FROM bill WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    }catch(error){
        res.send(error.message);
    }
})


app.get('/reviews', async (req, res) => {
    review.find({}, function(err, revs) {
        var userMap = {};
        revs.forEach(function(rev) {
          userMap[rev.patient_id] = rev.review;
        });
        console.log(userMap)
        res.send(userMap);  
    });
});

app.listen(port,()=>{
console.log(`listening to port ${port}`)
});
