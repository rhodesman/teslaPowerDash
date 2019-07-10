// app.js

'use strict';

const os = require('os');
const ifaces = os.networkInterfaces();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require('path');
const app = express();
const port = process.env.PORT || 3301;

var thisIPaddr;

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
      thisIPaddr = thisIPaddr + ',' + alias, iface.address + ':' + port;
    } else {
      // this interface has only one ipv4 adress
      //console.log(ifname, iface.address);
      thisIPaddr = iface.address + ':' + port;
    }
    ++alias;
  });
});

app.use(function (req, res, next) {
    //Allow Any system to access your API (change this to whatever you need)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('setup'));

var routes = require('./api/routes/appRoute'); //importing route
routes(app); //register the route

app.use(function (req, res) {
    res.status(404).send({
        url: req.originalUrl + ' not found'
    });
});



app.listen(port, () => {
    console.log(`Server running at http://${thisIPaddr}`);
});
