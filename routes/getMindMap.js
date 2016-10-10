const express = require("express"),
    fs = require("fs"),
    path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
    if (typeof req.query.name === "undefined") {
        res.json({"error": "Name not specyfied."}).end();

        return;
    }

    const pathToMindMaps = path.join(__dirname, "mindMaps"),
        mindMapName = req.query.name;

    fs.readFile(path.join(pathToMindMaps, mindMapName), "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.json({"error": "Failed to extract map."}).end();
        }
        res.json(JSON.parse(data)).end();
    });

});

module.exports = router;
