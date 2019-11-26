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
        const querry1 = "SELECT * FROM p_records WHERE P_Id='".concat(pid, "'");
        connection.query(querry1, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/getpdetails3', async (req, res) => {
    try {
        const pid = req.body.patient_id;
        const querry1 = "SELECT * FROM appointment WHERE P_Id='".concat(pid, "'");
        connection.query(querry1, function (err, result) {
            if (err) throw err;
            console.log(result);
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
                    const q3 = "DELETE FROM uses WHERE Name='".concat(name, "'", " AND D_Id='", userid, "'")
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
                        const q3 = "INSERT INTO uses VALUES(".concat("'", userid, "','", name, "')")
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

app.post('/genbill', async (req, res) => {
    //const dat = req.body;
    const billid = "bill".concat(req.body.paydate, req.body.pat_id)
    try {
        const quer = "INSERT INTO bill VALUES(".concat("'", billid, "','", req.body.procs, "','", req.body.cost, "','", req.body.paydate, "','", req.body.pat_id, "')")
        console.log(quer)
        connection.query(quer, function (err, result) {
            if (err) throw err;
            console.log(result);
            res.send("Successfull");
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/rempat', async (req, res) => {
    try {
        const id = req.body.pat_id;
        const quer = "DELETE FROM patient WHERE P_Id='".concat(id, "'")
        const quer2 = "DELETE FROM p_records WHERE P_Id='".concat(id, "'")
        connection.query(quer2, function (err, result) {
            if (err) throw err;
            console.log(result);
        });
        connection.query(quer, function (err, result) {
            if (err) throw err;
            console.log(result);
        });

        await User.remove({
            UserID: id
        })

        res.send("Successful");
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/remdoc', async (req, res) => {
    try {
        const id = req.body.doc_id;
        const quer = "DELETE FROM doctor WHERE Doc_Id='".concat(id, "'")
        console.log(quer);
        connection.query(quer, function (err, result) {
            if (err) throw err;
            console.log(result);
        });

        await User.remove({
            UserID: id
        })
        res.send("Successful");
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/newdoc', async (req, res) => {
    const dat = req.body
    try {
        const q1 = "SELECT * FROM doctor WHERE Doc_Id='".concat(dat.doc_id, "'")
        connection.query(q1, function (err, result) {
            if (err) throw err;
            if(result.length == 0){
                const q2 = "INSERT INTO doctor VALUES(".concat("'", dat.doc_add, "','", dat.doc_name, "','", dat.doc_qual, "','", dat.doc_id, "','", dat.doc_cont, "','", dat.doc_dep, "')")
                connection.query(q2, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
                const user = new User({
                    UserID : dat.doc_id,
                    Password : dat.doc_pass,
                    UserType : "Doctor"
                });
                user.save();
            }
            else{
                const q3 = "UPDATE doctor SET Address='".concat(dat.doc_add, "', Name='", dat.doc_name, "', Qualifications='", dat.doc_qual, "', Contact='", dat.doc_cont, "', D_ID='", dat.doc_dep, "' ", "WHERE Doc_Id='", dat.doc_id, "'")
                connection.query(q3, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
            }
        });
        res.send("Successful")
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/newpat', async (req, res) => {
    const dat = req.body;
    try{
        const q1 = "SELECT * FROM patient WHERE P_Id='".concat(dat.p_id, "'")
        connection.query(q1, function (err, result) {
            if (err) throw err;
            console.log(result);
            if(result.length == 0){
                const q2 = "INSERT INTO patient VALUES(".concat("'", dat.p_name, "','", dat.p_id, "','", dat.p_age, "','", dat.p_cont, "','", dat.p_add, "','", dat.p_doc, "')")
                const q3 = "INSERT INTO p_records VALUES(".concat("'", dat.p_trt, "','", dat.p_med, "','", dat.p_ill, "','", dat.p_id, "')")
                connection.query(q2, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
                connection.query(q3, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
                const user = new User({
                    UserID : dat.p_id,
                    Password : dat.p_pass,
                    UserType : "Patient"
                });
                user.save(); 
            }
            else{
                const q4 = "UPDATE patient SET P_Name='".concat(dat.p_name, "', Doc_Id='", dat.p_doc, "', P_Age='", dat.p_age, "', Contact='", dat.p_cont, "', Address='", dat.p_add, "' ", "WHERE P_Id='", dat.p_id, "'")
                const q5 = "UPDATE p_records SET Last_Treatment='".concat(dat.p_trt, "', Medicines='", dat.p_med, "', Illness='", dat.p_ill, "' ", "WHERE P_Id='", dat.p_id, "'")
                connection.query(q5, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
                connection.query(q4, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
            }
        });
        res.send("Successful");
    }catch (error) {
        res.send(error.message);
    }
})

app.post('/remequip', async (req, res) => {
    try {
        const nm = req.body.equip_name;
        const quer = "DELETE FROM equipments WHERE Name='".concat(nm, "'")
        const quer2 = "DELETE FROM uses WHERE Name='".concat(nm, "'")
        connection.query(quer2, function (err, result) {
            if (err) throw err;
            console.log(result);
        });
        connection.query(quer, function (err, result) {
            if (err) throw err;
            console.log(result);
        });
        res.send("Successful");
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/newequip', async (req, res) => {
    try {
        const name = req.body.equip_name;
        const exp = req.body.equip_exp;
        const quant = req.body.equip_quant;
        const avail = req.body.equip_avail;
        const price = req.body.equip_price;
        const dept = req.body.equip_dept;

        const q1 = "SELECT * FROM equipments WHERE Name='".concat(name + "'")

        connection.query(q1, function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                const q2 = "INSERT INTO equipments VALUES(".concat("'", exp, "','", quant, "','", avail, "','", price, "','", name, "','", dept, "')")
                connection.query(q2, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
            } else {
                const q2 = "DELETE FROM equipments WHERE Name='".concat(name, "'")
                const q3 = "INSERT INTO equipments VALUES(".concat("'", exp, "','", quant, "','", avail, "','", price, "','", name, "','", dept, "')")
                connection.query(q2, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
                connection.query(q3, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                });
            }
        });
        res.send("Successful");

    } catch (error) {
        res.send(error.message);
    }
})

app.listen(port, () => {
    console.log(`listening to port ${port}`)
});