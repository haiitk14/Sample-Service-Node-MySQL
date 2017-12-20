'use strict';

var Hapi = require('hapi');
var MySQL = require('mysql');
var server = new Hapi.Server();
var SHA256 = require("crypto-js/sha256");

const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'haidt123',
    database: 'sateco'
});

server.connection({
    host: 'localhost',
    port: 9999
});
connection.connect();

server.route({
    method: 'POST',
    path: '/login',
    handler: function (request, reply) {
        var username = request.payload.username;
        var password = request.payload.password;
        var orgPassword = SHA256(password);
        connection.query('SELECT userid, username FROM user WHERE username = "'+ username +'" AND password = "'+orgPassword+'"', function (error, results) {
            if (error) throw error;
            
            if(results.length > 0){
                reply({status : "200", results, message: "Success"});
            }else{
                reply({status: "201", message: "Error username / password"});
            }
        });
    }
});

server.route({
    method: 'POST',
    path: '/signup',
    handler: function (request, reply) {
        var username = request.payload.username;
        var password = request.payload.password;
        var orgPassword = SHA256(password);
        connection.query('SELECT * FROM user WHERE username = "'+ username + '"', function (error, results) {
            if (error){
                console.log(error);
                reply({status: "201", message: "Error connect data"});
                return;    
            }
            if(results.length > 0){
                reply({message: "Username "+ username +" already exist"});
            }else{
                connection.query('INSERT INTO user (username,password,user_role) VALUES ("' + username + '","' + orgPassword + '","' + 2 + '")', function (err, res) {
                    if (error){
                        console.log(error);
                        reply({status: "201", message: "Error connect data"});
                        return;
                    }
                    reply({status: "200", results, message: "Success"});
                });
            }
        });
    }
});

server.route({
    method: 'POST',
    path: '/changepassword',
    handler: function (request, reply) {
        var userId = request.payload.userId;
        var oldPassword = request.payload.oldPassword;
        var newPassword = request.payload.newPassword;
        var orgOldPassword = SHA256(oldPassword);
        var orgNewPassword = SHA256(newPassword);
        connection.query('SELECT * FROM user WHERE userid = "'+ userId +'" AND password = "'+ orgOldPassword +'"', function (error, results) {
            if (error){
                console.log(error);
                reply({status: "201", message: "Error connect data"});
                return;    
            }
            if(results.length == 0){
                reply({status: "202", message: "Error password old"});
            }else{
                connection.query('UPDATE user SET password = "'+ orgNewPassword +'"', function (err, res) {
                    if (error){
                        console.log(error);
                        reply({status: "201", message: "Error connect data"});
                        return;    
                    }
                    reply({status: "200", message: "Update password success"});
                });
            }
        });
    }
});

server.route({
    method: 'GET',
    path: '/getDataDeviceLast',
    handler: function (request, reply) {
        var query = 'SELECT * FROM `device` WHERE updated IN (SELECT max(updated) FROM `device`)';
        connection.query(query, function (error, results) {
            if (error){
                console.log(error);
                reply({status: "201", message: "Error connect data"});
                return;    
            }
            reply({status: "200", results});
        });
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server Sateco running at:', server.info.uri);
});

var intervalObject = setInterval(function () { 
        getDataLast(); 
    }, 10000);


function getDataLast() {
    var query = "SELECT * FROM `device` WHERE updated IN (SELECT max(updated) FROM `device`)";
    connection.query(query, function (error, results) {
        if (error){
            console.log(error);
            return;
        }
        insertDataDevice(results[0]);
    });
}

function insertDataDevice(device) {
    var lat = parseFloat(device.lat) + 0.01;
    var lng = parseFloat(device.lng) + 0.01;
    var query = 'INSERT INTO `device`(`lat`, `lng`, `userid`) VALUES ('+ lat +', '+ lng +', '+ 9 +')';

    connection.query(query, function (error, results) {
        if (error){
            console.log(error);
            return;
        }
    });
}

// server.route({
//     method: 'GET',
//     path: '/user/{uid}',
//     handler: function (request, reply) {
//         const uid = request.params.uid;

//         connection.query('SELECT userid, username FROM user WHERE userid = "' + uid + '"', function (error, results, fields) {
//             if (error) throw error;
//             console.log(results);
//             reply(results);
//         });

//     },
//     config: {
//         validate: {
//             params: {
//                 uid: Joi.number().integer()
//             }
//         }
//     }
// });