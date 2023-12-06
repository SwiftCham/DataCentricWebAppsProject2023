const express = require('express');
const app = express();
const port = 4000;
let ejs = require('ejs');

//database imports
var sqlDAO = require('./backEnd/sqlDAO.js');
var mongoDAO = require('./backEnd/mongoDAO.js');




app.get('/', (req, res) => {
  res.send('Hello World!')
});


app.get('/stores', (req, res) => {
  sqlDAO.getStore()
    .then(data => {
      res.render(stores.ejs, {stores: data});
    }).catch(err => {
      res.send(err);
    })
  });

app.get('/stores/edit/:sid', (req, res) => {
  sqlDAO.updateStore()
    .then(data => {
      res.render(stores.ejs, {stores: data});
    }).catch(err => {
      res.send(err);
    })
  });

app.get('products', (req, res) => {
  sqlDAO.getProducts()
    .then(data => {
      res.render(products.ejs, {products: data});
    }).catch(err => {
      res.send(err);
    })
  });





app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});