var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');


/* GET users listing. */
router.get('/', function(req, res, next) {
  

  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  var loadedMindMap = {};
  
  console.log (pathToMindMaps);
  fs.readFile(path.join(pathToMindMaps, 'ciachoMap.js'), 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    loadedMindMap = JSON.parse(data);
    
    res.json(loadedMindMap);
    res.end();
  });
  
  
});

module.exports = router;
