'use strict';

// load packages
const express = require('express');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');

const bodyParser = require("body-parser");
const fs = require('fs')

var https = require('https');

var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};


const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// client.connect();

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });


// var pgtools = require("pgtools");
// const config = {
//     host: "postgres",
//     port: 5432,
//     user: "admin",
//     password: "admin"
// };
// pgtools.createdb(config, "mydb", function(err, res) {
//   if (err) {
//     console.log("Postgres Database mydb already exists");
//     // process.exit(-1);
//   }
// //   console.log(res);
// });


// // const {Client} = require('pg');
// const Client = require('pg').Client;
// const client = new Client({
//     host: "postgres",
//     port: 5432,
//     user: "admin",
//     password: "admin",
//     database: "mydb"
// });


const PORT = process.env.PORT;
const HOST = '0.0.0.0';
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(helmet());


// conncet to database server to create database and tables if they don't exist
client.connect(function(err) {
    if (err) throw err;
    // console.log("Connected!");
    console.log("Connected to postgres database!")


    client.query("CREATE TABLE users(id SERIAL PRIMARY KEY,\
                        username VARCHAR(255) NOT NULL,\
                        fullname VARCHAR(255) NOT NULL,\
                        contact VARCHAR(255) NOT NULL,\
                        password VARCHAR(255) NOT NULL,\
                        reports VARCHAR(255) DEFAULT NULL,\
                        staff BOOLEAN NOT NULL)",
        function (err, result) {
        if (err) {
            // throw err;
            console.log("Table users already exists");
        }
        else{
            console.log("Table users created");
        }
    });

    client.query("CREATE TABLE lostpets(id SERIAL PRIMARY KEY,\
                username VARCHAR(255) NOT NULL,\
                contact VARCHAR(255) NOT NULL,\
                petname VARCHAR(255) NOT NULL,\
                petinfo VARCHAR(255) NOT NULL,\
                found BOOLEAN DEFAULT FALSE)",
                function (err, result) {
        if (err) {
            console.log("Table lostpets already exists");
        }
        else{
            console.log("Table lostpets created");
        }
});
});


var uname;
var fname;
var cont;
var isstaff;
// post method to get information parameters from webpage
app.post('/', (req, res) => {
    // appropriate actions if form submitted from login page
    if (req.body.form != undefined)
    {
        // check whether the user wanted to login or register
        if (req.body.form == "Login")
        {
            if (req.body.username == "" || req.body.password == ""){ res.sendFile(__dirname+'/files/login.html'); return;}
            uname = req.body.username.toLowerCase();
            
            var sql = "SELECT * FROM users WHERE username = '" + req.body.username.toLowerCase() + "' LIMIT 1";
            client.query(sql, function(err, result) {
                if (err) throw err;
                if (result.rows.length == 0)
                {
                    res.send("<script>alert('User not found!'); window.location.href = '/'; </script>");
                    console.log();
                    return;
                }
                
                if (result.rows[0].password != req.body.password)
                {
                    res.send("<script>alert('Password does not match user!'); window.location.href = '/'; </script>");
                    return;
                }
                fname = result.rows[0].fullname;
                cont = result.rows[0].contact;
                isstaff = result.rows[0].staff;
            });
            res.sendFile(__dirname+'/files/home.html');
        }

        else if (req.body.form == "Register")
        {
            res.sendFile(__dirname+'/files/register.html');
        }
    }

    // appropriate actions if form submitted from registration page
    else if (req.body.registering == "Register")
    {   
        // records if any fields were left empty
        var missing = [];
        if(req.body.username == "") {missing.push("Username");}
        if(req.body.fullname == "") {missing.push("Full Name");}
        if(req.body.contact == "") {missing.push("Contact");}
        if(req.body.password == "" || req.body.repassword == "") {missing.push("Password");}
        
        // send alert mentioning which fields were left empty
        if (missing.length != 0)
        {
            var missingVals = "";
            for (var x in missing){
                missingVals += missing[x] + ", "
            }
            res.send("<script>alert('Missing fields detected!\\n    " + missingVals.slice(0, -2) + "');\
                        window.location.href = '/register'; </script>");
            return;
        }
        
        // check if passwords match or not
        if(req.body.password != req.body.repassword) 
        {
            res.send("<script>alert('Passwords do not match!\\n');\
                        window.location.href = '/register'; </script>");
            return;
        }

        // check for valid staff ID code
        if(req.body.staff == "yes" && req.body.staffID != "353Pets") 
        {
            res.send("<script>alert('Staff ID authentication error!\\n');\
                        window.location.href = '/register'; </script>");
            return;
        }

        var isStaff = (req.body.staff == "yes");
        // client.query("USE mydb");
        // look for entered username in the table
        var sql = "SELECT * FROM users WHERE username = '" + req.body.username.toLowerCase() + "'";
        client.query(sql, function(err, result) {
            if (err) throw err;
            
            // console.log("============================> " + result.rows.length);
            // for (let row of result.rows) {
                //     console.log(row.username);
                // }

            // if found, send alert stating the username is taken
            if (result.rows.length != 0)
            {
                console.log("Username already taken!");
                res.send("<script>alert('Username already taken!'); window.location.href = '/register'; </script>");
            }
            // otherwise, insert new user data into the table
            else 
            {
                var sql = "INSERT INTO users (username, fullname, contact, password, reports, staff) VALUES($1, $2, $3, $4, $5, $6)";
                client.query(sql, [req.body.username.toLowerCase(), req.body.fullname, req.body.contact, req.body.password, "f", isStaff], function(err, result) {
                    if (err) throw err;
                    console.log("New values inserted.");
                });
                res.send("<script>alert('Registration Successful!'); window.location.href = '/'; </script>");
            }
        });
    }
});


app.post('/home', (req, res) => {

    if (uname == null)
    {
        console.log("No user found");
        res.send("<script>window.location.href = '/';</script>");
    }

    // records if any fields were left empty
    if(req.body.petname == "" || req.body.petinfo == "") 
    {
        res.send("<script>alert('Pet information missing!\\n');\
                    window.location.href = '/home'; </script>");
        return;
    }

    var sql = "INSERT INTO lostpets (username, contact, petname, petinfo, found) VALUES($1, $2, $3, $4, $5)";
    client.query(sql, [uname, cont, req.body.petname, req.body.petinfo, "f"], function(err, result) {
        if (err) throw err;
        console.log("Lost pet report added.");
    });

    var sql = "UPDATE users SET reports = '1' WHERE username = '" + uname + "'";
    client.query(sql, function(err, result) {
        if (err) throw err;
    });

    res.send("<script>alert('Lost pet registered.'); window.location.href = '/home'; </script>");
});


var getuser;
app.post('/staff', (req, res) => {

    if (req.body.action == "Change user data") 
    {   
        var staffStatus = 0;
        var foundStatus = 0;
        if (req.body.newstaff == "on") { staffStatus = 1};
        if (req.body.newfound == "on") { foundStatus = 1};


        if (req.body.newuname != "")
        {
            client.query("UPDATE users SET username = '" + req.body.newuname.toLowerCase() + "' WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; });
            client.query("UPDATE lostpets SET username = '" + req.body.newuname.toLowerCase() + "' WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; });
            // res.send("<script>localStorage.clear(); window.location.href = '/staff';</script>");
        }

        if (req.body.newfname != "")
        {
            client.query("UPDATE users SET fullname = '" + req.body.newfname + "' WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; });
        }

        if (req.body.newcontact != "")
        {
            client.query("UPDATE users SET contact = '" + req.body.newcontact + "' WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; });
            client.query("UPDATE lostpets SET contact = '" + req.body.newcontact + "' WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; });
        }
        

        client.query("UPDATE users SET staff = '" + staffStatus + "' WHERE username = '" + getuser + "'", function(err, result) {
            if (err) throw err; });


        if (req.body.rnum == "")
        {
            res.send("<script>window.location.href = '/staff';</script>");
            // return;
        }
        else 
        {
            client.query("SELECT * FROM lostpets WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; 

                client.query("UPDATE lostpets SET found = '" + foundStatus + "' WHERE username = '" + getuser + 
                            "' AND petname = '" + result.rows[req.body.rnum -1].petname + 
                            "' AND petinfo = '" + result.rows[req.body.rnum -1].petinfo +"'", function(err, result) {
                    if (err) throw err; });
            });
        }

        if (req.body.newpet != "")
        {
            client.query("SELECT * FROM lostpets WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; 
                
                client.query("UPDATE lostpets SET petname = '" + req.body.newpet + "' WHERE username = '" + getuser + 
                            "' AND petname = '" + result.rows[req.body.rnum -1].petname + 
                            "' AND petinfo = '" + result.rows[req.body.rnum -1].petinfo +"'", function(err, result) {
                    if (err) throw err; });
            });
        }


        if (req.body.newreport != "")
        {
            client.query("SELECT * FROM lostpets WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; 
                
                client.query("UPDATE lostpets SET petinfo = '" + req.body.newreport + "' WHERE username = '" + getuser + 
                            "' AND petname = '" + result.rows[req.body.rnum -1].petname + 
                            "' AND petinfo = '" + result.rows[req.body.rnum -1].petinfo +"'", function(err, result) {
                    if (err) throw err; });
            });
        }
    }


    else if (req.body.action == "Delete report") 
    {
        console.log("report deleted");
        client.query("SELECT * FROM lostpets WHERE username = '" + getuser + "'", function(err, result) {
            if (err) throw err;

            console.log("result.length: " + result.length)
            if (result.length == 1)
            {
                var sql = "UPDATE users SET reports = 0 WHERE username = '" + getuser + "'";
                client.query(sql, function(err, result) {
                    if (err) throw err;
                });
            }
            var i = 0;
            console.log("Length: " + result.length);
            if (result.length >= req.body.rdeleteri)
            {
                client.query("DELETE FROM lostpets WHERE username = '" + getuser + 
                            "' AND petname = '" + result.rows[req.body.rdeleteri - 1].petname + 
                            "' AND petinfo = '" + result.rows[req.body.rdeleteri - 1].petinfo +"'", function(err, result) {
                    if (err) throw err;
                    
                    res.send("<script>alert('Report " + req.body.rdeleteri + " deleted!'); window.location.href = '/staff'; </script>");
                });
            }
            else res.send("<script>alert('Report " + req.body.rdeleteri + " not found!'); window.location.href = '/staff'; </script>");
        });
        return;
    }


    else if (req.body.action == "Delete user") 
    {
        console.log("user deleted");
        client.query("DELETE FROM users WHERE username = '" + getuser + "'", function(err, result) {
            if (err) throw err;
            client.query("DELETE FROM lostpets WHERE username = '" + getuser + "'", function(err, result) {
                if (err) throw err; });
            res.send("<script>alert('User deleted: " + getuser + "'); window.location.href = '/staff'; </script>");
        });

        
        return;
    }

    else if (req.body.user != null)
    {
        getuser = req.body.user.toLowerCase();
        // return;
    }
    res.send("<script>window.location.href = '/staff';</script>");
});


app.get('/',function(req,res) {
    res.sendFile(__dirname+'/files/login.html');
});

app.get('/register',function(req,res) {
    res.sendFile(__dirname+'/files/register.html');
});

app.get('/home',function(req,res) {
    res.sendFile(__dirname+'/files/home.html');
});

app.get('/found',function(req,res) {
    res.sendFile(__dirname+'/files/found.html');
});

app.get('/staff',function(req,res) {    
    res.sendFile(__dirname+'/files/staff.html');
});

app.use(express.static('files'));


// set text file to be recieved by get method on html
app.get('/posts.txt', function (req, res) {
    res.sendFile( __dirname + "/" + "posts.txt");
})

app.get('/user', function (req, res) {
    res.send(uname + "\n" + fname + "\n" + isstaff);
});


// set database page to be recieved by get method in the html file
app.get('/lostpets', function (req, res) {

    // Select data in a specific sorted order to be merged together as a string as needed
    client.query("SELECT * FROM lostpets WHERE found = 'f'", function(err, result) {
        if (err) throw err;
        var i = 0;
        var string = ""
        var contactinfo = "";
        // loop over every row
        while (result.rows[i] != null)
        {
            // create concatonated string of topic, data, and timestamp in a certain format
            string = string + result.rows[i].username.charAt(0).toUpperCase() + result.rows[i].username.slice(1)
                 + " reported their missing pet: " + result.rows[i].petname +
                    "\n        Description: "+ result.rows[i].petinfo + 
                    "\n \nIf found, contact: "+ result.rows[i].contact + "\n\n";
            i++;
        }
        res.send(string);
    });
});

app.get('/foundpets', function (req, res) {

    // Select data in a specific sorted order to be merged together as a string as needed
    client.query("SELECT * FROM lostpets WHERE found = 't'", function(err, result) {
        if (err) throw err;
        var i = 0;
        var string = ""
        var contactinfo = "";
        // loop over every row
        while (result.rows[i] != null)
        {
            // create concatonated string of topic, data, and timestamp in a certain format
            string = string + result.rows[i].username.charAt(0).toUpperCase() + result.rows[i].username.slice(1)
                 + " was reunited with their pet: " + result.rows[i].petname +
                    "\n        Description: "+ result.rows[i].petinfo + 
                    "\n \nWe wish them a happy future!\n\n";
            i++;
        }
        res.send(string);
    });
});

app.get('/userdata', function (req, res) {
    var sql = "SELECT * FROM users WHERE username = '" + getuser + "'";
    var string = "";
    var staffStatus = "No";
    var foundStatus = "Not yet";
    var reports = [];
    client.query(sql, function(err, result) {
        if (err) throw err;

        // console.log(result.rows[0]);
        if (result.rows.length == 0)
        {
            res.send("<script>alert('User does not exist!'); window.location.href = '/staff'; </script>");
            return;
        }

        if (result.rows[0].staff == true) { staffStatus = "Yes"}
        string = result.rows[0].username + "\n\n" + result.rows[0].fullname + "\n\n" + result.rows[0].contact + "\n\n"  + staffStatus + "\n\n";
        
        client.query("SELECT * FROM lostpets WHERE username = '" + getuser + "'", function(err, result) {
            if (err) throw err;
            var i = 0;
            // loop over every row
            while (result.rows[i] != null)
            {
                if (result.rows[i].found == "1") { foundStatus = "Yes!"};
                string = string + "Pet name: " + result.rows[i].petname + 
                                    "\n                      Description: " + result.rows[i].petinfo +
                                    "\n                      Found: " + foundStatus + "\n \n\n";
                foundStatus = "Not yet"
                i++;
            }
            if (i > 0) string = string.slice(0, -4) + "\n\n";
            res.send(string);
        });
    });
});


app.get('/allusers', function (req, res) {
    var sql = "SELECT * FROM users;\
                    SELECT * FROM lostpets";
    var string = "";
    var string1 = "";
    var staffStatus = "No";
    var foundStatus = "Not yet";
    var reports = [];

    client.query(sql, function(err, result) {
        if (err) throw err;
        
        var i = 0;
        // console.log(result[0].rows);
        while (result[0].rows[i] != null)
        {
            if (result[0].rows[i].staff == true) { staffStatus = "Yes"}
            string = string + "Username: " +result[0].rows[i].username.charAt(0).toUpperCase() + result[0].rows[i].username.slice(1) + 
                                "\nFull Name: " + result[0].rows[i].fullname + 
                                "\nContact: " + result[0].rows[i].contact +
                                "\nStaff: " + staffStatus + "\nReports:\n";
            staffStatus = "No";
            
            if (result[0].rows[i].reports != "1")
            {
                string = string + "         ~ No reports found!" + "\n";
            }
            else
            {
                var p = 0;
                while (result[1].rows[p] != null)
                {
                    foundStatus = "Not yet";
                    if (result[1].rows[p].found == true) { foundStatus = "Yes!"};
                    
                    if (result[0].rows[i].username == result[1].rows[p].username)
                    {
                        string = string + "        ~ Pet name: " + result[1].rows[p].petname + 
                                        "\n           Description: " + result[1].rows[p].petinfo + 
                                        "\n           Found: " + foundStatus + "\n";
                    }
                    p++;
                }
            }
            string = string.slice(0, -1) + "\n\n";

        i++;
    }
        res.send(string);
    });
});



app.use('/', express.static('pages'));

app.listen(PORT || 5000, HOST);


console.log('Up and running...');
