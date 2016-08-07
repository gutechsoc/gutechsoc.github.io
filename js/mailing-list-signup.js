//var end = new Date('09/12/2015 8:21 PM');

$(function(){

    //the messageObject is one which has .messageType and .message  properties
    function updateSignupMessage(messageObject) {
      $('#signup-message').html(messageObject.message);

      $('#signup-message').show();
    }

    $('#signup-form').submit(function(event){
      var form = $(event.target);

      console.log(form);

      $.ajax({
        type: form.attr('method'),
         url: form.attr('action'),
         data: form.serialize(),
         success: function (data) {
            updateSignupMessage(data);
         },
        error: function (data) {
          updateSignupMessage(data);
        }
       });

      // avoid to execute the actual submit of the form.
      event.preventDefault();
      return false;
    });
});
