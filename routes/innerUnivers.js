const express = require("express"),
    router = express.Router();

router.get("/", (req, res) => {
    res.render("innerUniverse", { });
});

module.exports = router;
