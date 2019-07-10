var currentSettings;


$(function () {
  $.getJSON( "pwSettings.json", function( data ) {
    console.log(data);
    currentSettings = data;
    if(currentSettings != null) {
      $('#influxURL').val(currentSettings.influxURL);
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
    //console.log(formSettings);
    $.ajax({
      url: 'http://localhost:3301/submit-settings', // url where to submit the request
      type : "POST", // type of action POST || GET
      dataType : 'json', // data type
      data : formSettings, // post data || get data
      success : function(result) {
          // you can see the result from the console
          // tab of the developer tools
          console.log(result);
      },
      error: function(xhr, resp, text) {
          console.log(xhr, resp, text);
      }

    });
    onSubmit();

  });

});

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest() {
  // This is a sample server that supports CORS.
  var url = 'https://owner-api.teslamotors.com/oauth/token';

  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }
  xhr.setRequestHeader(

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    alert('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}

function onSubmit() {
  var form = new FormData();
  $.getJSON( "pwSettings.json", function( data ) {
    //console.log(data);
    currentSettings = data;
    if(currentSettings != null) {
      form.append("grant_type", "password");
      form.append("client_id", currentSettings.clientID);
      form.append("client_secret", currentSettings.clientSec);
      form.append("email",currentSettings.teslaUsr);
      form.append("password", teslaPW);
    }

  });

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://owner-api.teslamotors.com/oauth/token",
    "method": "POST",
    "headers": {
      "Accept": "*/*",
      "Host": "owner-api.teslamotors.com",
      "accept-encoding": "gzip, deflate"
    },
    "processData": false,
    "contentType": false,
    "mimeType": "multipart/form-data",
    "data": form
  }
  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}
