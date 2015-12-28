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
      console.log(err);
      res.json({error: err}).end();
      return;
    }
    console.log("Write ok : " + nameOfMindMap);
    
    res.status(200).end();
  });
  
  var nameOfBackup = nameOfMindMap + '.' + Date.now();
  fs.writeFile(path.join(pathToBackup, nameOfBackup), dataToSave, function (err,data) {
    if (err) {
      console.log(err);
      return
    }
    console.log("Write backup ok : " + nameOfBackup);
    
    res.status(200).end();
  });
  
});

module.exports = router;
