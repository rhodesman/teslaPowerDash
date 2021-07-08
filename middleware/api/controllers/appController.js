const request = require("request");
// Writing...
var fs = require("fs");

var settings;

var access_token;

fs.readFile('setup/pwSettings.json', (err, data) => {
  if (err == null) {
    settings = JSON.parse(data);
  }
});

exports.set_app_data = function (req, res, next) {
  var mySet = {
    influxURL: req.body.influxURL,
    nodeAPIserver: req.body.nodeAPIserver,
    clientID:req.body.clientID,
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
};

exports.get_token_data = function (req, res, next) {
  requestNewToken(function(newTokenBody) {
    console.log("Token Updated");
    res.send(newTokenBody);
  });
 };

// exports.update_token_data = function (req, res, next) {
//   //var expDate;
//   //var todayDate = new Date().getTime()/1000|0;
//   fs.readFile("setup/pwToken.json", function read(err, rawdata) {
//     if (err) {
//       res.json('204', '', '');
//     }
//     var data = JSON.parse(rawdata);
//     requestNewToken(function(newTokenBody) {
//       console.log("Token Updated");
//       res.send(newTokenBody);
//     });
//
//   });
//
// };

function requestNewToken(callback) {
  var expDate,
      todayDate,
      authURL,
      options;
  fs.readFile('setup/pwSettings.json', (err, data) => {
    if (err) {
      return err;
    }else {
      settings = JSON.parse(data);

      todayDate = new Date().getTime()/1000|0;
      authURL = settings.clientID + '/api/login/Basic';

      options = {
        'method': 'POST',
        'url': authURL,
        'headers': {
           'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': 'customer',
          'password': settings.teslaPW,
          'email': settings.teslaUsr
        })
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);

        fs.writeFile("setup/pwToken.json", response.body, (err) => {
          if (err) throw err;
        });
        var data = JSON.parse(response.body);

        access_token = data.token;

        callback(response.body);
      });
    };
  });

  // fs.readFile("setup/pwToken.json", function read(err, data) {
  //
  //   expDate = new Date(data.loginTime).getTime()/1000|0;
  //   expDate = todayDate - expDate;
  //   if(err || expDate >= 80000) {
  //     tokenRequest(options);
  //   }else {
  //     callback(response.body);
  //   }
  // });

}


exports.get_live_status = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/meters/aggregates",function(dataBody) {
    res.send(dataBody);
  });

};

exports.get_site_info = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/site_info",function(dataBody) {
    res.send(dataBody);
  });
};

exports.get_solar = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/meters/solar",function(dataBody) {
    res.send(dataBody);
  });
};

exports.get_site = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/meters/site",function(dataBody) {
    res.send(dataBody);
  });
};

exports.get_load = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/meters/load",function(dataBody) {
    res.send(dataBody);
  });
};

exports.get_status = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/system_status/grid_status",function(dataBody) {
    res.send(dataBody);
  });
};

exports.get_master = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/sitemaster",function(dataBody) {
    res.send(dataBody);
  });
};

exports.get_batt = function (req, res, next) {
  getAPIdata(settings.clientID + "/api/system_status/soe",function(dataBody) {
    res.send(dataBody);
  });
};

function getAPIdata(teslaUrl, callback) {
  var options = {
    "url": teslaUrl,
    "method": "GET",
    'headers': {
      'Authorization': 'Bearer ' + access_token
    }
  };
  request(options, function (error, response, body) {
    //console.log(options);
    if (error) {
      console.log(error);

    }
    callback(body);
  });
}
