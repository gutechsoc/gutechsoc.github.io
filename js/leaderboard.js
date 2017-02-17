/*
 This is some hacked together code for creating a leaderboard for cdx from a google sheet.
The google sheet needs to have team names in column A starting from row 2, and scores in column B starting from row 2.

to find the worksheet id for the sheet use this api call:
https://spreadsheets.google.com/feeds/worksheets/1at-FWTfCrWkDpgR6Dzb8D2ID9Kbop5DYQTmpT4tDTLo/public/basic?alt=json

to grab the cell data from that worksheet use this api call:
https://spreadsheets.google.com/feeds/cells/1at-FWTfCrWkDpgR6Dzb8D2ID9Kbop5DYQTmpT4tDTLo/osk8eva/public/basic?alt=json

Note that the sheet needs to be shared for anyone with a link to view, and it also needs to be PUBLISHED to the web (through the file menu)
*/



$(function(){

  var mixer = null;
  var fetchUrl = null;

  var mixerSort = function () {
      //why do we have to destroy the whole thing if we change the data values of an element? I hate javascript.
      if (mixer !== null) {
        $('.leaderboard').mixItUp('destroy');
      }

      mixer = mixitup('.leaderboard', {
                  selectors: {
                       target: '.mix'
                   }
                  });

      console.log("sorting!");
      mixer.sort('score:desc')
        .then(function(state) {
          //do nothing.
        });
  }

  var parseJSON = function (data) {
    var entryLookup = [];
    for (var entryIndex in data.feed.entry) {
      var entry = data.feed.entry[entryIndex];
      entryLookup[entry.title.$t] = entry.content.$t;
    }

    console.log(entryLookup);

    var teamPairs = [];

    var i = 2;
    while(i < 1000) {
      var a = entryLookup["A" + i];
      var b = entryLookup["B" + i];

      if (a === undefined || b === undefined) {
        break;
      }

      teamPairs.push({name: a, score: b});
      i++;
    }

    for (var pairIndex in teamPairs) {
      var pair = teamPairs[pairIndex];
      var elem = $('[data-name="'+ pair.name + '"]');
      if (elem.length) {
        elem.attr('data-score', pair.score);
        elem.find('.teamscore').html(pair.score);
      }
      else {
        $('.leaderboard').append('<div class="mix leaderboard-item" data-name="' + pair.name + '" data-score="' + pair.score + '"><h5 class="teamname">' + pair.name + '</h5><h5 class="teamscore">' + pair.score + '</h5></div>');
      }
    }


    // Pass the sorted collection to MixItUp. waiting enough time for the elements to be appended to the leaderboard.
    setTimeout(mixerSort, 500);
  }


  var wrappedUpdater = function () {
    $.getJSON(fetchUrl, parseJSON).error(
      function() {
        $('.leaderboard>.leaderboard-item.mix').remove();
        if(!$('#board-empty').length) {
          $('.leaderboard').append('<div class="leaderboard-item large" id="board-empty"><h4>' + "The leaderboard is unavailable. <br> Maybe just to keep you in suspense! ;)" + '</h4></div>'); }
        }
    ).success(function(){
      $('#board-empty').remove();
    });
  }

  fetchUrl = $('.leaderboard').attr('leaderboard-sheet');

  console.log(fetchUrl);

  wrappedUpdater();
  setInterval(wrappedUpdater, 10000);
});
