const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const multer = require('multer');
const path = require('path');
const app=express();

//const ObjectID = require('mongodb.ObjectID');

//error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object'?err.message:err;
    res.status(501).json(response);
};

//response handling

let response = {
    status:200,
    data:[],
    message:null
};


// file upload start

//public folder
app.use(express.static('./public'));


//set storage engine
const storage=multer.diskStorage({
    destination : "./assets/images/",
    filename(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Upload variable
const upload = multer({
    storage : storage
}).single('myfile');

//Uploading end

router.get('/users', (req, res) => {
  MongoClient.connect('mongodb://172.17.124.75', function (err, client) {
  if (err) throw err;
  var db = client.db('mean');
  db.collection('users')
  .find()
  .toArray()
  .then((users) => {
      response.data = users;
      res.json(response);
  })
  .catch((err) => {
    console.log(err);
  });
}); 
})

router.get('/', (req, res) => {
res.send("Server is running..");

})


router.get('/repo', (req, res) => {
    MongoClient.connect('mongodb://localhost', function (err, client) {
    if (err) throw err;
    var db = client.db('mean');
    db.collection('repository')
    .find()
    .toArray()
    .then((repository) => {
        response.data = repository;
        res.json(response);
    })
    .catch((err) => {
      console.log(err);
    });
  }); 
})

//signup

router.post('/insert', function (req, res, next){
     var user = {
        name:req.body.username,
        pass:req.body.password,
        accountType:'user',
        imageURL:'default_dp.jpg'
    };

    MongoClient.connect("mongodb://mongosql.westus2.cloudapp.azure.com", function(err, client){
        if (err) throw err;
        var db = client.db('ngvirtual');
        db.collection('users').insertOne(user, function(err, result){
            if (err) throw err;
               console.log("new user inserted...");
               client.close();
               
        });
    });
    res.redirect('/login');
});


//post image
router.post('/uploading', (req, res) => {
  upload(req, res, err=>{
    console.log(req.body);

        if(err) throw err;
        if (!req.file) {
            console.log("No file received");
            return res.send("No file selected");
        }
        else{
                console.log(req.file);
                  MongoClient.connect('mongodb://localhost', function (err, client) {
                    if (err) throw err;
                    var db = client.db('mean');
                    // db.collection('repository').insertOne(req.file);
                    db.collection('repository').update(
                        { _id: "repo" },
                        { $addToSet: { objects: { $each: [ {
                                                            "id" : "obj-"+Date.now(),
                                                            "name" : req.body.item,
                                                            "imageURL" : req.file.path,
                                                            "layoutCategory" : req.body.category
                                                           } 
                                                         ]
                                                }
                                      }
                        }
                      );
                    console.log("Image inserted into db");
                    }); 
                res.redirect('/admin/upload');
        }
    })

})

module.exports = router;