const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express();


//API file for interacting with MongoDB
const api = require('./server/routes/api')

//Parsers
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));

//Angular dist output folder
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/layout/images',express.static(__dirname+'/assets/images'));

//API location
app.use('/api', api);

//set port
const port = process.env.PORT || '3000';
app.set('port', port);
app.listen(port, () => console.log(`Running on localhost: ${port}`));