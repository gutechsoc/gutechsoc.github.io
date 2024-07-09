localStorage['code-olimpics'] = ''
localStorage['dyhtg'] = ''
localStorage['minor-events'] = ''

const showPastEvents = function (selectedSection, effectedElement)  {
    if(localStorage[selectedSection] === ''){
        //render content and assign to local storage variable

    }

}

const majorPastEventsList = document.getElementById('major-past-events').getElementsByClassName("events-list")[0]
const minorPastEventsList= document.getElementById('minor-past-events').getElementsByClassName("events-list")[0]

document.getElementById('btn-code-olimpcs').addEventListener('click', showPastEvents('code-olimpcs', majorPastEventsList))
document.getElementById('btn-dyhtg').addEventListener('click', showPastEvents('dyhtg', majorPastEventsList))
document.getElementById('btn-minor-past-events').addEventListener('click', showPastEvents('minor-events', minorPastEventsList))