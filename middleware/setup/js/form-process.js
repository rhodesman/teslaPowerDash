var currentSettings;

$(function () {
  $.getJSON( "pwSettings.json", function( data ) {
    //console.log(data);
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
    console.log(formSettings);
    $.ajax({
      url: 'http://localhost:3301/submit-settings', // url where to submit the request
      type : "POST", // type of action POST || GET
      dataType : 'json', // data type
      data : formSettings, // post data || get data
      success : function(result) {
          // you can see the result from the console
          // tab of the developer tools
          //console.log(result);
          setTimeout(function(){
            onSubmit();
          }, 1500);

      },
      error: function(xhr, resp, text) {
          console.log(xhr, resp, text);
      }

    });
    //onSubmit();

  });

});

function onSubmit() {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://127.0.0.1:3301/api/token",
    "method": "GET",
  }

  $.ajax(settings).done(function (response) {
    var jsonres = JSON.parse(response);
    $("#response").append('<div><p>Access Token: ' + jsonres.access_token + '</p></div>');
  });

}
