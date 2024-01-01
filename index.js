const path = require('path');
const express = require('express');
const app = express();
const port = 4010;
let ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//Import body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const { colorize } = require('./colors.js');


//database imports
var sqlDAO = require('./backEnd/sqlDAO.js');
var mongoDAO = require('./backEnd/mongoDAO.js');
const e = require('express');


//checks if mongodata is connected
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
app.post('/stores/:id', async (req, res) => {
  const storeId = req.params.id;
  const { sid, location, mgrid } = req.body; // Add sid parameter here
  
  // First, check if the manager ID exists in MongoDB
  const db = mongoDAO.getDb(); // Obtain the db instance
  const manager = await db.collection('managers').findOne({ _id: mgrid });

  if (!manager) {
    // If the manager ID doesn't exist in MongoDB, render the form with an error message
    res.render('editStore', {
      error: 'Manager ID does not exist in MongoDB',
      store: {
        sid: sid,
        location: location,
        mgrid: mgrid
      }
    });
    
  } else {
    await sqlDAO.editStore(sid, location, mgrid) // Use sid parameter here
      .then(() => {
        res.redirect('/stores'); //redirect to stores page
      })
      .catch(err => {
        if (err.message === 'Manager ID is already assigned to another store') {
          res.render('editStore', {
            error: err.message,
            store: {
              sid: storeId,
              location: location,
              mgrid: mgrid
            }
      });
    }
  })
  }
});


//when add button is pressed on stores page, display add page
app.get('/stores/add', function (req, res) {
  res.render('addStore');
});

//when add button is pressed on add page, add store to database
app.post('/stores/add/:sid', async (req, res) => {
  const { sid, location, mgrid } = req.body;

  try {
    const db = mongoDAO.getDb();
    const manager = await db.collection('managers').findOne({ _id: mgrid });

    if (!manager) {
      //If the manager ID doesn't exist in MongoDB
      throw new Error('Manager ID does not exist in MongoDB');
    }
    
    //Check for null values in the request body
    if (!sid || !location || !mgrid) {
      throw new Error('Data cannot be null');
    }

    await sqlDAO.addStore(sid, location, mgrid);
    res.redirect('/stores');
  } catch (err) {
    //render the addStore page with the error message
    res.render('addStore', {
      error: err.message,
      sid: sid,
      location: location,
      mgrid: mgrid
    });
  }
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
      //Handle errors appropriately
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

app.get('/managers/add', (req, res) => {
  res.render('addManager');
});
//add manager to database
app.post('/managers/add', async (req, res) => {
  try {
    const db = mongoDAO.getDb(); // Obtain the db instance
    const { mgrid, name, salary } = req.body;
    const managerData = {
      _id: mgrid,  // Use the ID from the form directly
      name,
      salary: parseFloat(salary) // Ensure salary is a number
    };
    await db.collection('managers').insertOne(managerData);
    res.redirect('/managers');
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      const { mgrid, name, salary } = req.body;
      res.render('addManager', { 
        error: `Error: Manager ${mgrid} already exists in MongoDB`,
        mgrid,
        name,
        salary
      });
    } else {
      console.error('Error adding manager:', err);
      res.status(500).send('Internal Server Error');
    }
  }
});


//edit manager in database
app.get('/managers/edit/:id', async (req, res) => {
  try {
    const db = mongoDAO.getDb();
    const managerId = req.params.id;
    const manager = await db.collection('managers').findOne({ _id: managerId });
    if (manager) {
      res.render('editManager', { manager });
    } else {
      res.status(404).send('Manager not found');
    }
  } catch (err) {
    console.error('Error fetching manager:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/managers/update/:id', async (req, res) => {
  try {
    const db = mongoDAO.getDb();
    const managerId = req.params.id;
    const { name, salary } = req.body;
    await db.collection('managers').updateOne({ _id: managerId }, { $set: { name, salary } });
    res.redirect('/managers');
  } catch (err) {
    console.error('Error editing manager:', err);
    res.status(500).send('Internal Server Error');
  }
});

//delete manager from database
app.get('/managers/delete/:id', async (req, res) => {
  try {
    const db = mongoDAO.getDb();
    const managerId = req.params.id;
    await db.collection('managers').deleteOne({ _id: managerId });
    res.redirect('/managers');
  } catch (err) {
    console.error('Error deleting manager:', err);
    res.status(500).send('Internal Server Error');
  }
})

