#!/usr/bin/env node
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const  { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const sd = require('silly-datetime');
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/node/merkle', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(merkleProof(req.body.address));
})
app.post('/node/listCheck', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(listCheck(req.body.address));
})

app.post('/node/polynnetwork/listCheck', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(listCheckByFile(req.body.address,"polynnetworkalladdress.txt"));
})
app.post('/node/polynnetwork/merkle', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(merkleProofByFile(req.body.address,"polynnetworkaddress.txt"));
})

app.post('/node/cwallet/listCheck', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(listCheckByFile(req.body.address,"cwalletaddress.txt"));
})
app.post('/node/cwallet/merkle', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(merkleProofByFile(req.body.address,"cwalletaddress.txt"));
})

app.post('/node/IsekaiGenesis/OGmerkle', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(merkleProofByFile(req.body.address,"OGaddress.txt"));
})
app.post('/node/IsekaiGenesis/WLmerkle', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(merkleProofByFile(req.body.address,"WLaddress.txt"));
})
app.post('/node/IsekaiGenesis/listCheck', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    res.end(IsekaiGenesisListCheck(req.body.address));
})
app.post('/node/IsekaiGenesis/log', function (req, res) {
    res.status(200);
    res.setHeader("Access-Control-Allow-Origin","*");
    res.type("application/json");
    var fileName;
    if(req.body.type=="public"){
        fileName = 'publiclog.txt'
    }else if(req.body.type=="OG"){
        fileName = 'oglog.txt'
    }else if(req.body.type=="WL"){
        fileName = 'wllog.txt'
    }
    res.end(writeAddressAndBalanceToFile(fileName, req.body.address, req.body.balance));
})


function merkleProof(address) {
    let whitelistAddresses = new Array()
    const allFileContents = fs.readFileSync('address.txt', 'utf-8');
    allFileContents.split(/\r?\n/).forEach(line =>  {
        whitelistAddresses.push(line);
    });

	let leafNodes = whitelistAddresses.map(address => keccak256(address));
	let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

	const root = tree.getRoot();
	console.log('Root hash is: ', root.toString('hex'));

	let leaf = keccak256(address);
	let proof = tree.getHexProof(leaf);
	console.log('Proof:', proof);
    return proof+""
}

function merkleProofByFile(address,fileName) {
    let whitelistAddresses = new Array()
    const allFileContents = fs.readFileSync(fileName, 'utf-8');
    allFileContents.split(/\r?\n/).forEach(line =>  {
        whitelistAddresses.push(line);
    });

	let leafNodes = whitelistAddresses.map(address => keccak256(address));
	let tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

	const root = tree.getRoot();
	console.log('Root hash is: ', root.toString('hex'));

	let leaf = keccak256(address);
	let proof = tree.getHexProof(leaf);
	console.log('Proof:', proof);
    return proof+""
}

function listCheck(address) {
    console.log('address:', address);
    const allFileContents = fs.readFileSync('address.txt', 'utf-8');
    var result = "false";
    allFileContents.split(/\r?\n/).forEach(line =>  {
        if(address.toUpperCase() == line.toUpperCase()){
            console.log('success');
            result = "ture";
        };
    });
    return result;
}

function listCheckByFile(address,fileName) {
    console.log('address:', address);
    const allFileContents = fs.readFileSync(fileName, 'utf-8');
    var result = "false";
    allFileContents.split(/\r?\n/).forEach(line =>  {
        if(address.toUpperCase() == line.toUpperCase()){
            console.log('success');
            result = "ture";
        };
    });
    return result;
}


function IsekaiGenesisListCheck(address) {
    console.log('address:', address);
    const OGFileContents = fs.readFileSync('OGaddress.txt', 'utf-8');
    const WLFileContents = fs.readFileSync('WLaddress.txt', 'utf-8');
    var result = "NO";
    var WLresult = false;
    var OGresult = false;
    WLFileContents.split(/\r?\n/).forEach(line =>  {
        if(address.toUpperCase() == line.toUpperCase()){
            console.log('success');
            WLresult = true;
        };
    });
    OGFileContents.split(/\r?\n/).forEach(line =>  {
        if(address.toUpperCase() == line.toUpperCase()){
            console.log('success');
            OGresult = true;
        };
    });
    if(WLresult && OGresult){
        result = "YESOG"
    }else if(!WLresult && OGresult){
        result = "OG"
    }else if(WLresult && !OGresult){
        result = "YES"
    }else{
        result = "NO"
    }
    return result;
}




function writeAddressAndBalanceToFile(fileName, address, balance) {

    const time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    fs.appendFile(fileName,time+': '+address+': '+ balance+'\n', 'utf8',
        function(err) {
            if (err) console.log(err.stack);
        });
}

var server = app.listen(8001, function () {
    const host = server.address().address
    const port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
