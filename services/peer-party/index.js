const express = require("express");


const router = express.Router();

var offer;
var answer;

var masterCandidate;
var slaveCandidate;

router.options("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Origin", "*");
    console.log("options");
    res.status(200);
    res.send("success");
})

router.post("/createoffer", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body);
    offer = req.body.sdp;
    res.send("offer stored");
});

router.get("/getoffer", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("getoffer");
    res.json(offer);
});

router.post("/provideanswer", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("providing answer");
    answer = req.body.sdp;
    res.send("answer provided");
});

router.get("/getanswer",function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.json(answer);
});

router.post("/createMasterCandidate",function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    masterCandidate = req.body;
    res.send("master candidate stored");
});

router.post("/createSlaveCandidate",function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    slaveCandidate = req.body;
    res.send("slave candidate stored");
});

router.get("/getMasterCandidate",(req,res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(masterCandidate);
});

router.get("/getSlaveCandidate",(req,res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(slaveCandidate);
});

module.exports = router;