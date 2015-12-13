var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');


/* GET users listing. */
router.get('/', function(req, res, next) {
  
  console.log(req.query);
  if (typeof req.query.name === 'undefined') {
      res.json({error: 'Name not specyfied.'}).end();
      return;
  }

  var pathToMindMaps = path.join(__dirname, 'mindMaps');
  var mindMapName = req.query.name;
  
  fs.readFile(path.join(pathToMindMaps, mindMapName), 'utf8', function (err,data) {
    if (err) {
      console.log(err);
      res.json({error: 'Failed to extract map.'}).end();
    }
    res.json(JSON.parse(data)).end();
  });
  
  
});

module.exports = router;
