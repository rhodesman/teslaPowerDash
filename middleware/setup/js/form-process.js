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
