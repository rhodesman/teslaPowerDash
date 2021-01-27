var currentSettings;
var ajaxURL;

$(function () {
  $.getJSON( "pwSettings.json", function( data ) {
    //console.log(data);
    currentSettings = data;
    if(currentSettings != null) {
      $('#nodeAPIserver').val(currentSettings.nodeAPIserver);
      $('#clientID').val(currentSettings.clientID);
      $('#clientSec').val(currentSettings.clientSec);
      $('#teslaUsr').val(currentSettings.teslaUsr);
      $('#teslaPW').val(currentSettings.teslaPW);
    }
  });

  $('.btn').on('click', function(e) {
    e.preventDefault();
    var formSettings = $('form').serializeArray();
    var submitURL = formSettings[1].value + '/submit-settings';
    
    formSettings[1].value = formSettings[1].value + '/api';
    ajaxURL = formSettings[1].value;
    //console.log(formSettings);

    $.ajax({
      url: submitURL, // url where to submit the request
      type : "POST", // type of action POST || GET
      dataType : 'json', // data type
      data : formSettings, // post data || get data
      success : function(result) {
          // you can see the result from the console
          // tab of the developer tools
          setTimeout(function(){
            onSubmit();
          }, 900);

      },
      error: function(xhr, resp, text) {
          console.log(xhr, resp, text);
      }
    });
  });

});

function onSubmit() {
  var token;
  var tokenURL = ajaxURL + '/token';
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": tokenURL,
    "method": "GET",
  }
  $.ajax(settings).done(function (response) {
    var jsonres = JSON.parse(response);
    token = jsonres.access_token;
    $("#response").append('<div><p>Access Token: <code>' + token + '</code></p></div>');
    var productURL = ajaxURL + '/products/';
    settings = {
      "async": true,
      "crossDomain": true,
      "url": productURL + token,
      "method": "GET",
    }
    $.ajax(settings).done(function (response) {
      var jsonres = JSON.parse(response);
      $("#response").append('<div><p>Product ID: <code>' + jsonres.response[0].energy_site_id + '</code></p></div>');
      if(jsonres.response[1] != null){
        $("#response").append('<div><p>Product ID #2: <code>' + jsonres.response[1].energy_site_id + '</code></p></div>');
        $("#response").append('<div><p>Your Tesla API URL: <code>' + ajaxURL + '/tesla/' + token + '/energy_sites/'+ jsonres.response[1].energy_site_id +'/live_status </code></p></div>');
      }else {
        $("#response").append('<div><p>Your Tesla API URL: <code>' + ajaxURL + '/tesla/' + token + '/energy_sites/'+ jsonres.response[0].energy_site_id +'/live_status </code></p></div>');
      }

    });
  });
}
