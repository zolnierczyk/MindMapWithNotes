const express = require("express"),
    fs = require("fs"),
    path = require("path");

const router = express.Router();

router.get("/", (req, res) => {

    if (typeof req.query.name === "undefined") {
        res.json({"error": "Name not specified."}).end();

        return;
    }

    const pathToMindMaps = path.join(__dirname, "mindMaps");

    fs.createReadStream(path.join(pathToMindMaps, "empty.js"))
        .pipe(fs.createWriteStream(path.join(pathToMindMaps, req.query.name)));
});

module.exports = router;
