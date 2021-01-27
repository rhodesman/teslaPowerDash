const request = require("request");
// Writing...
var fs = require("fs");

var settings;

fs.readFile('setup/pwSettings.json', (err, data) => {
  if (err == null) {
    settings = JSON.parse(data);
  }
});

exports.set_app_data = function (req, res, next) {
  //const username = req.body.username
  var mySet = {
    nodeAPIserver: req.body.nodeAPIserver,
    clientID:req.body.clientID,
    clientSec:req.body.clientSec,
    teslaUsr:req.body.teslaUsr,
    teslaPW:req.body.teslaPW
  };

  fs.writeFile( "setup/pwSettings.json", JSON.stringify( mySet ), (err) => {
    if (err) {
      throw err;
    } else {
      console.log('The file has been saved!');
      res.send(req.body);
    }

  });

  //res.end();
};

exports.get_token_data = function (req, res, next) {
  var options = {
    method: 'POST',
    url: 'https://owner-api.teslamotors.com/oauth/token',
    headers: {
       Host: 'owner-api.teslamotors.com',
       'Cache-Control': 'no-cache',
       Accept: '*/*',
       'User-Agent': 'Powerwall Dashboard',
       'Content-Type': 'application/json',
       'authorization': 'Bearer ${auth}'
    },
    formData: {
       grant_type: 'password',
       client_id: settings.clientID,
       client_secret: settings.clientSec,
       email: settings.teslaUsr,
       password: settings.teslaPW
     }
   };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
    res.send(body);
  });
};
exports.get_products = function (req, res, next) {
  var token = "Bearer " + req.params.token;
  var options = {
    "url": "https://owner-api.teslamotors.com/api/1/products",
    "method": "GET",
    "headers": {
      Host: 'owner-api.teslamotors.com',
      'Cache-Control': 'no-cache',
      Accept: '*/*',
      'User-Agent': 'Powerwall Dashboard',
      'Content-Type': 'application/json',
      Authorization: token
    }
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
  });
};
exports.get_api_data = function (req, res, next) {
  //:product/:id/:type/:token
  var token = "Bearer " + req.params.token;
  var product = req.params.product;
  var prodID = req.params.id;
  var dataType = req.params.type;
  var teslaUrl = 'https://owner-api.teslamotors.com/api/1/';
  if(dataType != null) {
    teslaUrl = teslaUrl + '/' + product + '/' + prodID + '/' + dataType;
  }else {
    teslaUrl = teslaUrl + '/' + product + '/' + prodID
  }
  var options = {
    "url": teslaUrl,
    "method": "GET",
    "headers": {
      Host: 'owner-api.teslamotors.com',
      'Cache-Control': 'no-cache',
      Accept: '*/*',
      'User-Agent': 'Powerwall Dashboard',
      'Content-Type': 'application/json',
      Authorization: token
    }
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);

  });
};

exports.find_api_data = function (req, res, next) {
  res.json('200', '', '');
};
exports.get_hist_data = function (req, res, next) {
  var token = "Bearer " + req.params.token;
  var thisQuery = req.params.searchType;
  var teslaUrl = 'https://owner-api.teslamotors.com/api/1/powerwalls/{gateway-ID}/powerhistory';

  if ( req.params.searchType == "query") {

    var query_data = req.body;
    //console.log(req);
    var fromDate = "StartTime="+query_data.range.from;
    var toDate = "EndTime="+query_data.range.to;
  }

  teslaUrl = teslaUrl + '?' + toDate + '&' + fromDate;

  var options = {
    "url": teslaUrl,
    "method": "GET",
    "headers": {
      Host: 'owner-api.teslamotors.com',
      'Cache-Control': 'no-cache',
      Accept: '*/*',
      'User-Agent': 'Powerwall Dashboard',
      'Content-Type': 'application/json',
      Authorization: token
    }
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
  });
};
