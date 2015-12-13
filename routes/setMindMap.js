var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.post('/', function(req, res, next) {

  //console.log(req.body);
  var dataToSave = JSON.stringify(req.body);
  
  
  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  var pathToBackup = path.join(pathToMindMaps, 'backup');
  fs.writeFile(path.join(pathToMindMaps, 'ciachoMap.js'), dataToSave, function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log("Write ok");
  });
  
  fs.writeFile(path.join(pathToBackup, 'ciachoMap_' + Date.now() + '.js'), dataToSave, function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log("Write backup ok");
  });
  
});

module.exports = router;
