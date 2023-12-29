const path = require('path');
const express = require('express');
const app = express();
const port = 4010;
let ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Import body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const { colorize } = require('./colors.js');


//database imports
var sqlDAO = require('./backEnd/sqlDAO.js');
var mongoDAO = require('./backEnd/mongoDAO.js');



mongoDAO.connect().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});


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
  res.render('addStore');
});

//when add button is pressed on add page, add store to database
app.post("/stores/add", function(req, res)  {
  console.log(req.body);
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

//display all products from database
app.get('/products', (req, res) => {
  sqlDAO.getAllProducts()
    .then((data) => {
      res.render('products', { products: data });
    }).catch((err) => {
      //output error message in red text using escape code
      console.log(colorize('red', 'Error in Index.js: \n ' + err));
      res.send(err);
    })
  });

//delete product from database
app.get('/products/delete/:pid', (req, res) => {
  const productId = req.params.pid;
  sqlDAO.checkProductInStores(productId)
      .then((productStores) => {
          if (productStores.length > 0) {
              //Product is sold in stores, so it cannot be deleted
              return res.status(400).send(`${productId} is currently in stores and cannot be deleted`);
          } else {
              return sqlDAO.deleteProduct(productId)
                  .then(() => {
                      //Redirects only after successful deletion.
                      res.redirect('/products');
                  });
          }
      })
      .catch((err) => {
          // Handle errors appropriately
          console.error('Error:', err);
          res.status(500).send('Error processing your request');
      });
});

/*
*MONGO DB
*/
app.get('/managers', async (req, res) => {
  try {
    const db = mongoDAO.getDb();
    const managers = await db.collection('managers').find({}).toArray();
    managers.sort((a, b) => (a._id > b._id) ? 1 : -1);

    res.render('managers', { managers });
  } catch (err) {
    console.error('Error fetching managers:', err);
    res.status(500).send('Internal Server Error');
  }
});




