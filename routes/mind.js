const express = require("express"),
    guard = require("connect-ensure-login");

const router = express.Router();

/* GET home page. */
router.get("/",
           // guard.ensureLoggedIn('/'),
           (req, res) => {
               res.render("mind", { });
           });

module.exports = router;
