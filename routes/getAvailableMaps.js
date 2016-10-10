"use strict";

const express = require("express"),
    fs = require("fs"),
    path = require("path");

const router = express.Router();

router.get("/", (req, res) => {

    const pathToMindMaps = path.join(__dirname, "mindMaps");

    fs.readdir(pathToMindMaps, (err, files) => {
        if (err) {
            res.json({"error": err}).end();

            return;
        }
        let index = files.indexOf("empty.js");

        if (index > -1) {
            files.splice(index, 1);
        }
        index = files.indexOf("backup");
        if (index > -1) {
            files.splice(index, 1);
        }
        res.json(files).end();
    });

});

module.exports = router;
