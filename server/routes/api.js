const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const multer = require('multer');
const path = require('path');
const app=express();

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

//insert project
router.post('/insertProject', (req, res)=>{
    MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client){
        if(err) throw err;
        var db = client.db('ngvirtual');
       db.collection('repo').insertOne(req.body, function(err, result){
            if (err) throw err;
               client.close();
               res.send("Done");
        });
    })
})

//retrieve project
router.get('/getProject', (req, res) => {
  MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
  if (err) throw err;
  var db = client.db('ngvirtual');
  db.collection('repo')
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

//fetch user details for login validation
router.get('/users', (req, res) => {
  MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
  if (err) throw err;
  var db = client.db('ngvirtual');
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

//for fetching layouts and objects respository
router.get('/repo', (req, res) => {
    MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
    if (err) throw err;
    var db = client.db('ngvirtual');
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

//getting Layouts
router.get('/layouts', (req, res) => {
    console.log("layouts api called");
    MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
    if (err) throw err;
    var db = client.db('ngvirtual');
    db.collection('layouts')
    .find()
    .toArray()
    .then((layouts) => {
        response.data = layouts;
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
               res.send("New user inserted");
               client.close();
               
        });
    });
});

//for sending message
router.post('/sendmsg', function (req, res, next){
     var msg = {
        msgSubject:req.body.msgSubject,
        msgBody:req.body.msgBody,
        sender:req.body.from,
        msgDate:req.body.msgDate,
        to:req.body.to
    };

    MongoClient.connect("mongodb://mongosql.westus2.cloudapp.azure.com", function(err, client){
        if (err) throw err;
        var db = client.db('ngvirtual');
        db.collection('messages').insertOne(msg, function(err, result){
            if (err) throw err;
            res.send("message sent")
               console.log("message sent");
               client.close();
               
        });
    });
});

//for sending reply to users
router.post('/reply', function (req, res, next){
     var reply = {
       to:req.body.to,
       from:req.body.from,
       reply:req.body.reply
    };

    MongoClient.connect("mongodb://mongosql.westus2.cloudapp.azure.com", function(err, client){
        if (err) throw err;
        var db = client.db('ngvirtual');
        db.collection('reply').insertOne(reply, function(err, result){
            if (err) throw err;
            res.send("reply sent")
               client.close();
               
        });
    });
});

//for receiving message
router.get('/getmsg', (req, res) => {
  MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
  if (err) throw err;
  var db = client.db('ngvirtual');
  db.collection('messages')
  .find()
  .toArray()
  .then((messages) => {
      response.data = messages;
      res.json(response);
  })
  .catch((err) => {
    console.log(err);
  });
}); 
})

//get replies
router.get('/getreply', (req, res) => {
  MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
  if (err) throw err;
  var db = client.db('ngvirtual');
  db.collection('reply')
  .find()
  .toArray()
  .then((messages) => {
      response.data = messages;
      res.json(response);
  })
  .catch((err) => {
    console.log(err);
  });
}); 
})

// file upload start

//set storage engine
const storage=multer.diskStorage({destination : "./assets/images/",
                                  filename(req, file, cb){ 
                                      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                                }});

//Upload variable
const upload = multer({storage: storage});

//Upload layout or item
router.post('/upload',
             upload.fields([
                            {name: 'right', maxCount: 1},
                            {name: 'left', maxCount: 1},
                           {name: 'top', maxCount: 1},
                           {name: 'bottom', maxCount: 1},
                           {name: 'front', maxCount: 1},
                           {name: 'back', maxCount: 1}
                          ]),
             function (req, res, next) {
                if(req.body.type=='layout'){
                  MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
                    if (err) throw err;
                    var db = client.db('ngvirtual');
                    db.collection('layouts').insertOne({
                                                        "name" : "test",
                                                        "thumbnail" : req.body.thumbnail,
                                                        "sides" : [ 
                                                                    location+req.files.right[0].filename,
                                                                    location+req.files.top[0].filename, 
                                                                    location+req.files.left[0].filename,
                                                                    location+req.files.bottom[0].filename, 
                                                                    location+req.files.front[0].filename, 
                                                                    location+req.files.back[0].filename
                                                                    ],
                                                        "dimensions" : [ 250, 100, 160],
                                                        "layoutCategory" : req.body.category
                                                        });             
                    console.log("Image inserted into db");
                    });
                }
                else if(req.body.type=='item')
                {
                    MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
                        if (err) throw err;
                        var db = client.db('ngvirtual');
                        db.collection('items').insertOne({
                                                            "name" : "test",
                                                            "thumbnail" : "",
                                                            "layoutCategory" : req.body.category
                                                            });             
                        console.log("Image inserted into db");
                        });
                }
                res.redirect('http://magicdecor.azurewebsites.net/#/admin/'+req.body.type);

  });

//Uploading end

//retrieving objects
router.get('/getObjects',(req,res)=>{
MongoClient.connect('mongodb://mongosql.westus2.cloudapp.azure.com', function (err, client) {
  if (err) throw err;
  var db = client.db('ngvirtual');
  db.collection('a_objects')
  .find()
  .toArray()
  .then((object) => {
      response.data = object;
      res.json(response);
  })
  .catch((err) => {
    console.log(err);
  });
}
)});

module.exports = router;