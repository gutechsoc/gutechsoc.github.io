$(function(){

  var mixer = null;

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
            console.log(state);
            console.log('sorted!');
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
    $.getJSON('https://spreadsheets.google.com/feeds/cells/1at-FWTfCrWkDpgR6Dzb8D2ID9Kbop5DYQTmpT4tDTLo/osk8eva/public/basic?alt=json', parseJSON);
  }

  wrappedUpdater();
  setInterval(wrappedUpdater, 10000);
});
