var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res, next) {

  var nameOfNewMindMap = req.query.name;
  console.log(req.query.name);
  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  console.log(pathToMindMaps);
  
  fs.createReadStream(path.join(pathToMindMaps, 'empty.js'))
    .pipe(fs.createWriteStream(path.join(pathToMindMaps, nameOfNewMindMap)));

  
});

module.exports = router;
