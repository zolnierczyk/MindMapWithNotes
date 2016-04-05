var express = require('express');
var router = express.Router();
var guard = require('connect-ensure-login');

/* GET home page. */
router.get('/',
           //guard.ensureLoggedIn('/'),
           function(req, res, next) {
  res.render('mind', {  });
});

module.exports = router;
