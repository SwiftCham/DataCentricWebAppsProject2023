const path = require('path');
const express = require('express');
const app = express();
const port = 4000;
let ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Import body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const { colorize } = require('./colors.js');


//database imports
var sqlDAO = require('./backEnd/sqlDAO.js');
//var mongoDAO = require('./backEnd/mongoDAO.js');




app.get('/', (req, res) => {
  res.render('index.ejs');
});

//display all stores from database
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

  //when edit button is pressed on stores page, display edit page
  app.get('/stores/edit/:id', (req, res) => {
    const storeId = req.params.id;
    sqlDAO.getStoreById(storeId) //get store data from database
      .then((storeData) => {
        if (storeData) {
          res.render('editstore', { store: storeData }); //Pass the store data to the view
        } else {
          res.status(404).send('Store not found');
        }
      })
      .catch(err => {
      console.log(colorize('red', 'Error in Index.js: \n ' + err));
      res.status(500).send('Error fetching store data');
    });
});

//when edit button is pressed on edit page, edit store in database
app.post('/stores/:id', (req, res) => {
  const storeId = req.params.id;
  const { location, mgrid } = req.body;
  sqlDAO.editStore(storeId, location, mgrid)
    .then(() => {
      res.redirect('/stores'); //redirect to stores page
    })
    .catch(err => {
      res.send(err);
    });
});

//when add button is pressed on stores page, display add page
app.get('/stores/add', function(req, res) {
  res.render('addstore');
});

//when add button is pressed on add page, add store to database
app.post('/stores/add', function(req, res)  {
  sqlDAO.addStore(req.body.sid, req.body.location, req.body.mgrid)
    .then(() => {
      res.redirect('/stores'); //redirect to stores page
    })
    .catch(err => {
      console.error('Error in adding store:', err);
      res.status(500).send('Failed to add store');
    })
});

//when delete button is pressed on stores page, delete store from database
app.post('/stores/delete/:id', (req, res) => {
  const storeId = req.params.id;
  sqlDAO.deleteStore(storeId)
    .then(() => {
      res.redirect('/stores'); //redirect to stores page
    })
    .catch(err => {
      res.send(err);
    });
});

app.listen(port, () => {
  console.log(colorize('orange', `App listening at http://localhost:${port}`));
});