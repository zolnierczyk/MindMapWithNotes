var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.post('/', function(req, res, next) {

  //console.log(req.body);
  var nameOfMindMap = req.body.name;
  var dataToSave = JSON.stringify(req.body);
  
  
  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  var pathToBackup = path.join(pathToMindMaps, 'backup');
  fs.writeFile(path.join(pathToMindMaps, nameOfMindMap), dataToSave, function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log("Write ok : " + nameOfMindMap);
  });
  
  fs.writeFile(path.join(pathToBackup, nameOfMindMap + '.' + Date.now()), dataToSave, function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log("Write backup ok : " + nameOfMindMap);
  });
  
});

module.exports = router;
