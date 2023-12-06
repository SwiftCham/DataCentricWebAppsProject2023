var express = require('express');
var app = express();
var pmysql = require('promise-mysql'); //promise-mysql is a wrapper for mysql that allows us to use promises instead of callbacks
var pool;

pmysql.createPool({
    connectionLimit : 3,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'proj2023' //database name
}).then(p => {
    pool = p;
}).catch(err => {
    console.log("Pool Error: " +err);
});

function getStore() {
    return new Promise((resolve, sreject) => {
        pool.query('SELECT * FROM store_table')//TODO: amend name of table
        .then((data => {
            resolve(data);
        }))
        .catch(err => {
            sreject(err);
        });
    });
}


function updateStore() {
    return new Promise((resolve, sreject) => {
        pool.query('UPDATE FROM store_table WHERE sid = ?', [sid])//TODO: amend name of table
        .then((data => {
            resolve(data);
        }))
        .catch(err => {
            sreject(err);
        });
    });
}

function addStore() { 
    return new Promise((resolve, sreject) => {
        pool.query('INSERT INTO store_table WHERE sid = ?', [sid])//TODO: amend name of table
        .then((data => {
            resolve(data);
        }))
        .catch(err => {
            sreject(err);
        });
    });
}

function deleteStore() {
    return new Promise((resolve, sreject) => {
        pool.query('DELETE FROM store_table WHERE sid = ?', [sid])//TODO: amend name of table
        .then((data => {
            resolve(data);
        }))
        .catch(err => {
            sreject(err);
        });
    });
}


function getProducts() {
    return new Promise((resolve, sreject) => {
        pool.query('SELECT * FROM product_store_table')//TODO: amend name of table
        .then((data => {
            resolve(data);
        }))
        .catch(err => {
            sreject(err);
        });
    });

}

function deleteProduct() {
    return new Promise((resolve, sreject) => {
        pool.query('DELETE FROM product_store_table WHERE pid = ?', [pid])//TODO: amend name of table + join table
        .then((data => {
            resolve(data);
        }))
        .catch(err => {
            sreject(err);
        });
    });
}

module.exports = { getStore, updateStore, addStore, deleteStore, getProducts, deleteProduct };