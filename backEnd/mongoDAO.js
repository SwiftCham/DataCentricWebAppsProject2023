var express = require('express');
var app = express();

const MongoClient = require('mongodb').MongoClient
MongoClient.connect=('mongodb://localhost:27017/')
    .then((client) => {
        const db = client.db('proj2023');
        const storeCollection = db.collection('store_table');
        const productCollection = db.collection('product_table');
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.log(err);
    });