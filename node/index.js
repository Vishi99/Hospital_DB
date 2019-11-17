const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.use(express.json());
const port = process.env.port || 3000
app.use(express.static('../public'));

mongoose.connect(process.env.mongodbURI, {
        useNewUrlParser: true
    })
    .then(() => {
        console.log("Successfull")
    });

var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql@102',
    database: 'Hospital'
})
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MYSQL!");
});


var userid = ""

const User = require('./models/user')
app.post('/auth', async (req, res) => {
    //console.log(req.body)
    try {
        const exists = await User.findOne({
            UserID: req.body.UserID,
            Password: req.body.Password,
            UserType: req.body.UserType
        });

        if (!exists)
            return res.status(400).send("User doesn't Exist")

        else {
            //console.log("Successfull login")
            userid = req.body.UserID;
            res.send(req.body);
        }
    } catch (error) {
        res.send(error.message);
    }
});

const review = require('./models/review')
app.post('/review', async (req, res) => {

    try {
        const exists = await review.findOne({
            patient_id: req.body.patient_id
        })

        if (exists) {
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
    } catch (error) {
        res.send(error.message);
    }
});

app.post('/billpay', async (req, res) => {
    try {
        //const pid = req.body.patient_id;
        const querry1 = "DELETE FROM bill WHERE P_id ='".concat(userid, "'");
        connection.query(querry1, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/p_details', async (req, res) => {
    try {
        const querry = "SELECT * FROM patient WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/p_record', async (req, res) => {
    try {
        const querry = "SELECT Illness, Medicines FROM p_records WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/p_appoint', async (req, res) => {
    try {
        const querry = "SELECT Date, Time, D_Id  FROM appointment WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/p_proced', async (req, res) => {
    try {
        const querry = "SELECT Date, Time, Name  FROM procedure_at WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/p_bill', async (req, res) => {
    try {
        const querry = "SELECT No_of_Procedures, Total_Cost, Date_of_Payment FROM bill WHERE P_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    } catch (error) {
        res.send(error.message);
    }
})


app.get('/reviews', async (req, res) => {
    review.find({}, function (err, revs) {
        var userMap = {};
        revs.forEach(function (rev) {
            userMap[rev.patient_id] = rev.review;
        });
        console.log(userMap)
        res.send(userMap);
    });
});


app.get('/doc_details', async (req, res) => {
    try {
        const querry = "SELECT Name, Qualifications, Contact, D_ID FROM doctor WHERE Doc_Id='".concat(userid, "'");
        connection.query(querry, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            res.send(result)
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/getpdetails', async (req, res) => {
    try {
        const pid = req.body.patient_id;
        const querry1 = "SELECT P_Id, P_name, P_Age, Doc_Id FROM patient WHERE P_Id='".concat(pid, "'");
        connection.query(querry1, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/getpdetails2', async (req, res) => {
    try {
        const pid = req.body.patient_id;
        const querry1 = "SELECT Last_Treatment, Medicines, Illness FROM p_records WHERE P_Id='".concat(pid, "'");
        connection.query(querry1, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/getappointment', async (req, res) => {
    try {
        const type = req.body.app_type;
        if (type === "Appointment") {
            const query1 = "SELECT * FROM appointment WHERE D_Id='".concat(userid, "'", "AND Date='", req.body.app_date, "'", "AND Time='", req.body.app_time, "'");
            connection.query(query1, function (err, result) {
                if (err) throw err;
                if (result.length != 0) {
                    return res.send("Slot not available")
                } else {
                    const id = "app".concat(req.body.patient_id, req.body.app_date, req.body.app_time)
                    const query2 = "INSERT INTO appointment VALUES(".concat("'", req.body.app_date, "','", req.body.app_time, "','", id, "','", userid, "','", req.body.patient_id, "')")
                    connection.query(query2, function (err, result) {
                        if (err) throw err;
                        res.send(result)
                    });
                }
            });
        } else if (type === "Procedure") {
            const query1 = "SELECT * FROM procedure_at WHERE D_Id='".concat(userid, "'", "AND Date='", req.body.app_date, "'", "AND Time='", req.body.app_time, "'");
            connection.query(query1, function (err, result) {
                if (err) throw err;
                if (result.length != 0) {
                    res.send("Slot not available")
                } else {
                    const id = "proc".concat(req.body.patient_id, req.body.app_date, req.body.app_time)
                    const query2 = "INSERT INTO procedure_at VALUES(".concat("'", req.body.app_date, "','", req.body.app_time, "','", id, "','", req.body.app_name, "','", req.body.patient_id, "','", userid, "')")
                    connection.query(query2, function (err, result) {
                        if (err) throw err;
                        res.send(result)
                    });
                }
            });
        }
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/getequip', async (req, res) => {
    try {
        const act = req.body.equip_act
        const name = req.body.equip_name
        const query1 = "SELECT * FROM equipments WHERE Name='".concat(name, "'");
        connection.query(query1, function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                res.send("Wrong Equipment Name")
            } else {
                console.log(result)
                if (act == "Return") {
                    const q2 = "UPDATE equipments SET Available_no='".concat(result[0]["Available_no"] + 1, "'", " WHERE Name='", name, "'")
                    const q3 = "DELETE FROM uses WHERE Name='".concat(name, "'"," AND D_Id='", userid, "'")
                    console.log(q3)
                    connection.query(q3, function (err, result) {
                        if (err) throw err;
                    })
                    connection.query(q2, function (err, result) {
                        if (err) throw err;
                    })
                    res.send("Successfull")
                } else {
                    if (result[0]["Available_no"] === 0) {
                        return res.send("Equipment not available")
                    } else {
                        const q2 = "UPDATE equipments SET Available_no='".concat(result[0]["Available_no"] - 1, "'", " WHERE Name='", name, "'")
                        const q3 = "INSERT INTO uses VALUES(".concat("'", userid, "','", name,"')")
                        connection.query(q2, function (err, result) {
                            if (err) throw err;
                        })
                        connection.query(q3, function (err, result) {
                            if (err) throw err;
                        })
                    }
                    res.send("Successfull")
                }
            }
        })
    } catch (error) {
        res.send(error.message);
    }
})


app.listen(port, () => {
    console.log(`listening to port ${port}`)
});