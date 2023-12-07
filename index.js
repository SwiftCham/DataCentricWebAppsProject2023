const path = require('path');
const express = require('express');
const app = express();
const port = 4000;
let ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const { colorize } = require('./colors.js');

//database imports
var sqlDAO = require('./backEnd/sqlDAO');
//var mongoDAO = require('./backEnd/mongoDAO.js');




app.get('/', (req, res) => {
  res.render('index.ejs');
});


app.get('/stores', (req, res) => {
  sqlDAO.getStore()
    .then((data) => {
      res.render('stores', { stores: data });
    }).catch((err) => {
      //output error message in red text using escape code
      console.log(colorize('red', 'Error in Index.js: \n ' + err));
      res.send(err);
    })
  })

app.get('/stores/edit/:sid', (req, res) => {
  sqlDAO.updateStore(sid, location, mgrid)
    .then(data => {
      res.render(stores.ejs, {stores: data});
    }).catch(err => {
      res.send(err);
    })
  });
/*
app.get('products', (req, res) => {
  sqlDAO.getProducts()
    .then(data => {
      res.render(products.ejs, {products: data});
    }).catch(err => {
      res.send(err);
    })
  });
*/




app.listen(port, () => {
  console.log(colorize('orange', `App listening at http://localhost:${port}`));
});