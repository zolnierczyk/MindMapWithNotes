const express = require("express"),
    fs = require("fs"),
    path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
    const nameOfMindMap = req.body.name,
        dataToSave = JSON.stringify(req.body),
        pathToMindMaps = path.join(__dirname, "mindMaps"),
        pathToBackup = path.join(pathToMindMaps, "backup");

    fs.writeFile(path.join(pathToMindMaps, nameOfMindMap), dataToSave,
        (err) => {
            if (err) {
                console.error(err);
                res.json({"error": err}).end();

                return;
            }

            res.status(200).end();
        });

    const nameOfBackup = `${nameOfMindMap}.${Date.now()}`;
    fs.writeFile(path.join(pathToBackup, nameOfBackup), dataToSave, (err) => {
        if (err) {
            console.error(err);

            return;
        }
        console.log(`Write backup ok : ${nameOfBackup}`);
        res.status(200).end();
    });

});

module.exports = router;
