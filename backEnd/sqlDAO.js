
var express = require('express');
var app = express();
require('dotenv').config();
var pmysql = require('promise-mysql'); //promise-mysql is a wrapper for mysql that allows us to use promises instead of callbacks

var pool;

const username = process.env.SQLDB_USER;
const password = process.env.SQLDB_PASSWORD;
const database = process.env.SQLDB_DATABASE;
const host = process.env.SQLDB_HOST;
const port = process.env.SQLDB_PORT;
const connectionLimit = process.env.SQLDB_CONNECTION_LIMIT;   

pmysql.createPool({
    connectionLimit : connectionLimit,
    host : host,
    user : username,
    password : password,
    database : database , //database name
    port : port
}).then(p => {
    pool = p;
}).catch(err => {
    console.log("Pool Error: " +err);
});

function getStore() {
    return new Promise((resolve, reject) => {
     pool.query('SELECT * FROM store')
        .then((data) => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        })
    })
}

//update a store using the values from the editStore page
function editStore(sid, location, mgrid) {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE store SET location = ?, mgrid = ? WHERE sid = ?', [location, mgrid, sid])
        .then((data) => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        })
    })
}


//add a new store to the database using the values from the addStore page
function addStore(sid, location, mgrid) {
    return new Promise((resolve, reject) => {
        pool.query("INSERT INTO store(sid, location, mgrid) VALUES(?, ?, ?)", [sid, location, mgrid])
        .then((data) => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        })
    })
}

function deleteStore(sid) {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM store WHERE sid = ?', [sid])
        .then((data) => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        })
    })
}



function getStoreById(sid) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store WHERE sid = ?', [sid])
        .then((data) => {
            resolve(data[0]); //return the first row of data
        })
        .catch(err => {
            console.log(colorize('red', 'Error in sqlDAO.js: \n ' + err));
            reject(err);
        })
    })
}

module.exports = { getStore, addStore, editStore, getStoreById, addStore, deleteStore }; // Add getStoreById to the exports

