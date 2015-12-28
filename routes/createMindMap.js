var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res, next) {

  console.log(req.query);
  if (typeof req.query.name === 'undefined') {
      res.json({error: 'Name not specified.'}).end();
      return;
  }
  
  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  console.log(pathToMindMaps);
  
  fs.createReadStream(path.join(pathToMindMaps, 'empty.js'))
    .pipe(fs.createWriteStream(path.join(pathToMindMaps, req.query.name)));

  
});

module.exports = router;
