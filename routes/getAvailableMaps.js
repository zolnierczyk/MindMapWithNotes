var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res, next) {

  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  console.log(pathToMindMaps);
  fs.readdir(pathToMindMaps, function (err, files) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(files);
    var index = files.indexOf('empty.js');
    if (index > -1) {
            files.splice(index, 1);
    }
    index = files.indexOf('backup');
    if (index > -1) {
            files.splice(index, 1);
    }

    res.json(files).end();

  });
  
});

module.exports = router;
