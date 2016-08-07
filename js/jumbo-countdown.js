
$(function(){
    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;
    var timer;

    function showRemaining() {
        var now = new Date();
        var distance = countdownEnd - now;
        if (distance < 0) {

            $('.intro-lead-out').html(countdownEndedMessage);

            clearInterval(timer);
            return;
        }
        var days = Math.floor(distance / _day);
        var hours = Math.floor((distance % _day) / _hour);
        var minutes = Math.floor((distance % _hour) / _minute);
        var seconds = Math.floor((distance % _minute) / _second);

        // if(days>0) {
        //   //if we are here then it is days till it starts
        //   $('#hack-countdown').html(days);
        //   if(days==1) {
        //     $('#countdown-units').html('day');
        //   } else {
        //     $('#countdown-units').html('days');
        //   }
        // } else if (days===0 && hours>0) {
        //   //if we are here then it must only be hours till it starts
        //   $('#hack-countdown').html(hours);
        //   if(hours==1) {
        //     $('#countdown-units').html('hour');
        //   } else {
        //     $('#countdown-units').html('hours');
        //   }
        // } else if (days===0 && hours===0 && minutes>0){
        //   //if we are here then it must only be minutes till it starts
        //   $('#hack-countdown').html(minutes);
        //   if(minutes==1) {
        //     $('#countdown-units').html('minute');
        //   } else {
        //     $('#countdown-units').html('minutes');
        //   }
        // } else {
        //   //if we are here then it must only be minutes till it starts
        //   $('#hack-countdown').html(seconds);
        //   if(seconds==1) {
        //     $('#countdown-units').html('second');
        //   } else {
        //     $('#countdown-units').html('seconds');
        //   }
        // }

        var dayString = days + (days==1? " day" : " days");
        var hourString = hours + (hours==1? " hour" : " hours");
        var minuteString = minutes + (minutes==1? " minute" : " minutes");
        var secondString = seconds + (seconds==1? " second" : " seconds");
        $('#hack-countdown').html(dayString + " " + hourString + " " + minuteString + " " + secondString);
        $('#countdown-units').html('');


    }

    showRemaining();
    timer = setInterval(showRemaining, 1000);
});
