'use strict';

var Hapi = require('hapi');
var MySQL = require('mysql');
// Create a server with a host and port
var server = new Hapi.Server();
var SHA256 = require("crypto-js/sha256");



const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sateco'
});

server.connection({
    host: 'localhost',
    port: 9999
});
connection.connect();

// Login the route
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
                reply({status: "201", message: "Account not exist"});
            }
        });
    }
});

// Signup the route
server.route({
    method: 'POST',
    path: '/signup',

    handler: function (request, reply) {

        var username = request.payload.username;
        var password = request.payload.password;
        var orgPassword = SHA256(password);
        
        connection.query('INSERT INTO user (username,password,user_role) VALUES ("' + username + '","' + orgPassword + '","' + 2 + '")', function (error, results) {
            if (error){
                console.log(error);
                reply({status: "201", message: "Error connect data"});
                return;    
            }
            reply({status: "200", results, message: "Success"});
        });
    }
});

// Change password the route
server.route({
    method: 'POST',
    path: '/changepassword',

    handler: function (request, reply) {

        var oldPass = request.payload.oldPassword;
        var newPassword = request.payload.newPassword;
        var orgPassword = SHA256(newPassword);


        
        // connection.query('INSERT INTO user (username,password,user_role) VALUES ("' + username + '","' + orgPassword + '","' + 2 + '")', function (error, results) {
        //     if (error){
        //         console.log(error);
        //         reply({status: "201", message: "Error connect data"});
        //         return;    
        //     }
        //     reply({status: "200", results, message: "Success"});
        // });
    }
});

var checkLogin=function (request, reply, next) {
    if(request.session.username){
        next();
    }else{
        reply({"no": 1});
    }
};

// Add the route
server.route({
    method: 'GET',
    path: '/user',
    handler: function (request, reply) {
        connection.query('SELECT userid, username, password, user_role FROM user', function (error, results) {
            if (error) throw error;
            console.log(results);
            reply(results);
        });
    }
});

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


// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server Sateco running at:', server.info.uri);
});