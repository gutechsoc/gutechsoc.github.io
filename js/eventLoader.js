// Keep track of how many events have been loaded into each section
let upcoming = {"targetElement": null, "numEventsAdded": 0, "id": "upcoming"};
let codeolympics = {"targetElement": null, "numEventsAdded": 0, "id": "codeolympics"};
let dyhtguts = {"targetElement": null, "numEventsAdded": 0, "id": "dyhtguts"};
let other = {"targetElement": null, "numEventsAdded": 0, "id": "other"};

// Arrays of events and sponsors
let eventsList = { "upcoming": [], "codeolympics": [], "dyhtguts": [], "other": [] };
let sponsors = [];

/*
Triggered on page load
Initialisation of events
 - Adds some events to each event section
 - Fetches the list of events
 - Fetches the list of sponsors
Adds event listeners for the navigation highlights
Fills in the Sponsor Us section
*/
async function setup() {
    // Add event listeners for highlighting navigation
    scrollSetup()

    // Get a list of all events
    addEventToList((await getRequest('events/eventsList.json')));

    // Get a list of all sponsors
    sponsors = await getRequest('sponsors/sponsors.json');

    loadSponsorUsSection();

    // Get elements from the DOM
    upcoming["targetElement"] = document.getElementById('upcoming-events-list');
    codeolympics["targetElement"] = document.getElementById('codeolympics-events-list');
    dyhtguts["targetElement"] = document.getElementById('dyhtguts-events-list');
    other["targetElement"] = document.getElementById('other-events-list');

    // Load three events of each category
    addEvents(upcoming, 3)
    addEvents(dyhtguts, 3);
    addEvents(codeolympics, 3);
    addEvents(other, 3);

}

// Generic get requester, returns the content of the request, handles (some) errors
async function getRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        // Process and return data based on the response header
        switch (response.headers.get("content-type")) {
            case "text/html":
                return await response.text();
            case "application/json":
                return await response.json();
            default:
                throw new Error(`Content type: ${response.headers.get("content-type")} not supported.`)
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
Adds more event elements to a section
Just a string to object function for the load more events buttons
*/
async function loadMoreEvents(section, amount) {
    switch (section) {
        case "upcoming":
            return await addEvents(upcoming, amount)

        default:
            return;

        case "codeolympics":
            await addEvents(codeolympics, amount)
            return refreshEventGroupHeight(codeolympics["targetElement"])

        case "dyhtguts":
            await addEvents(dyhtguts, amount);
            return refreshEventGroupHeight(dyhtguts["targetElement"])

        case "other":
            await addEvents(other, amount)
            return refreshEventGroupHeight(other["targetElement"])

    }
}

// Adds the sponsors to the scrolling marquees in the Sponsor Us Section
function loadSponsorUsSection(){

    // Each marquee is slit into 2 sections to allow for the appearance of continuous scrolling
    let topMarqueeOne = ``
    let topMarqueeTwo = ``
    let bottomMarqueeOne = ``
    let bottomMarqueeTwo = ``
    let topMarqueeElementOne = document.getElementById("sponsors-top-marquee-one")
    let topMarqueeElementTwo = document.getElementById("sponsors-top-marquee-two")
    let bottomMarqueeElementOne = document.getElementById("sponsors-bottom-marquee-one")
    let bottomMarqueeElementTwo= document.getElementById("sponsors-bottom-marquee-two")
    let chosenSponsors = getMarqueeSponsors()

    // The number of sponsors chosen related to achieving the infinite marquee effect
    // For more sponsors please see README
    if( chosenSponsors.length % 4 !== 0){
        console.log("Warning: Sponsors marquee chosen sponsors is not a multiple of 4")
    }

    for(let i=0; i < chosenSponsors.length ;i++){
        let sponsorValue = chosenSponsors[i]
        switch(i%4){
            case 0:
                topMarqueeOne += makeSponsorImage(sponsorValue)
                break;
            case 1:
                topMarqueeTwo += makeSponsorImage(sponsorValue)
                break;
            case 2:
                bottomMarqueeOne += makeSponsorImage(sponsorValue)
                break;
            case 3:
                bottomMarqueeTwo += makeSponsorImage(sponsorValue)
                break;
            default:
                break;
        }
    }
    // Pastes the generated text into respective HTML elements
    topMarqueeElementOne.innerHTML = topMarqueeOne
    topMarqueeElementTwo.innerHTML = topMarqueeTwo
    bottomMarqueeElementOne.innerHTML = bottomMarqueeOne
    bottomMarqueeElementTwo.innerHTML = bottomMarqueeTwo
}

// Forms a clickable sponsors image that displays logo and links to website
function makeSponsorImage(sponsorName){
    let newImage= ``
    if(!sponsors[sponsorName]){
        console.log(`Sponsor image not found for "${sponsorName}\"`)
        newImage = `asset not found`
    }else{
        newImage = `<a href="${sponsors[sponsorName]["url"]}">`
        // If sponsor image not found then display error message
        newImage += `<img src="sponsors/logos/${sponsors[sponsorName]["logo"]}" alt="${sponsors[sponsorName]["name"]||`${sponsorName} not found!`}">`
        newImage += '</a>'
    }
    return newImage
}

// Add X amounts of events to a section
async function addEvents(eventSection, amount) {
    // Remove the load more button to prevent duplicate buttons
    eventSection["targetElement"].innerHTML =  eventSection["targetElement"].innerHTML.replace(/<button.*button>/gi, "")

    let startIndex = eventSection["numEventsAdded"];

    // Dont add more events if we've exhausted them all
    if (startIndex === eventsList[eventSection["id"]].length) {
        console.log(`All events have been added for ${eventSection["id"]}`);
        return;
    }

    // Dont try to add more events than we have left
    if (startIndex + amount > eventsList[eventSection["id"]].length) {
        amount = eventsList[eventSection["id"]].length - eventSection["numEventsAdded"];
    }

    // Grab the old list of events to append to
    let content = ``;
    content += eventSection["targetElement"].innerHTML;

    // Append the requested number of events
    for (let i = startIndex; i < startIndex + amount; i++) {
        content += await getRequest('events/html/' + eventsList[eventSection["id"]][i]["html"]);
        eventSection["numEventsAdded"] += 1
    }

    // Update the event list
    eventSection["targetElement"].innerHTML = content;

    // The events have to be in the DOM before we can add the sponsors
    setupSponsors();

    // Add the load more button if there is more events not displayed
    if (! (eventSection["numEventsAdded"] === eventsList[eventSection["id"]].length)) {
        eventSection["targetElement"].innerHTML += `<button class="load-events-button" onclick="loadMoreEvents('${eventSection["id"]}', 2)">Load More</button>`
    }
}

/*
Adds sponsors to events
Iterates over each event that does not have sponsors setup
Discovers the sponsors to add from the class list
*/
function setupSponsors() {
    let sponsorSections

    // It wouldnt let us iterate over getElementsByClassName so this is a little hacky
    while ((sponsorSections = document.getElementsByClassName("event-sponsors-presetup")).length > 0) {
        // Select the first section
        let sponsorSection = sponsorSections.item(0);

        // Remove the temporary class
        sponsorSection.classList.remove("event-sponsors-presetup")

        // Setup scrolling for sponsors
        let content = `<marquee behavior="scroll" direction="left">`;

        // Add each sponsor
        for (let classItem of sponsorSection.classList) {
            content += makeSponsorImage(classItem)
        }

        // Close the scrolling tag
        content += `</marquee>`;

        // Add the permanent class
        sponsorSection.classList.add("event-sponsors");
        sponsorSection.innerHTML = content
    }
}

/*
Filters upcoming events into the upcoming section
Sorts the events based on date & time: for past events, sorts most recent first, for upcoming events, sorts closest event first
*/
function addEventToList(events) {
    // Process all events while filtering out upcoming events from appearing in the past events section

    // Format date to filter out upcoming events
    let tempDate = new Date().toISOString();
    let currentDate = `${tempDate.slice(0, 4)}${tempDate.slice(5, 7)}${tempDate.slice(8, 10)}`;

    // Sort events into their lists and filter out upcoming events
    for (let key of Object.keys(events)) {
        for (let event of events[key]) {
            if (event["date"] > currentDate) { // Upcoming event
                eventsList['upcoming'].push(event)
            } else { // Past event
                eventsList[key].push(event);
            }
        }
    }

    // Sort events based on date then time
    for (let eventsListKey in eventsList) {
        if (eventsListKey === "upcoming") { // For upcoming we want to display the soonest event first
            eventsList[eventsListKey].sort(function (a, b) {
                if (a["date"] > b["date"]) {
                    return 1;
                } else if (a["date"] < b["date"]) {
                    return -1;
                }

                if (a["time"] > b["time"]) {
                    return 1;
                } else if (a["time"] < b["time"]) {
                    return -1;
                } else {
                    return 0;
                }
            });
        } else { // For events that have already happened, we want to display the latest event held first
            eventsList[eventsListKey].sort(function (a, b) {
                // return a["date"] < b["date"] || a["time"] < b["time"]
                if (a["date"] < b["date"]) {
                    return 1;
                } else if (a["date"] > b["date"]) {
                    return -1;
                }

                if (a["time"] < b["time"]) {
                    return 1;
                } else if (a["time"] > b["time"]) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }
    }
}

/*
Expands and collapses event cards
Adjusts the height of the container if necessary
*/
function toggleEventDetails(eventOverview) {
    // Toggle the colour and visibility of events
    let eventContainer = eventOverview.parentElement;
    let eventDetails = eventOverview.nextElementSibling;
    let selected = false;

    // Expand/collapse the event card
    if (!eventContainer.classList.contains("selected")) { // Expand
        eventContainer.style.background = "var(--selected-background-colour)"
        eventContainer.classList.add("selected");
        eventDetails.style.maxHeight = eventDetails.scrollHeight + "px"
        selected = true;
    } else { // Collapse
        eventContainer.style.background = "var(--card-background-colour)"
        eventDetails.style.maxHeight = "0"
        eventContainer.classList.remove("selected")
    }

    // If its not an upcoming event, expand the event list container
    if (eventContainer.parentElement.id !== "upcoming-events-list") {
        if (selected) {
            refreshEventGroupHeight(eventContainer.parentElement, eventDetails.scrollHeight);
        } else {
            refreshEventGroupHeight(eventContainer.parentElement, -eventDetails.scrollHeight);

        }
    }
}

/*
Expand and collapse the codeolympics and dyhtgs event groups
Ensures only one is visible at a time
*/
function toggleEventGroup(element, group, disable) {

    let currentContent = document.getElementById(group);
    let disableContent = document.getElementById(disable + "-events-list")
    let disableElement = document.getElementById(disable +"-tab-option")
    let displayElement = document.getElementById("major-past-events-tab-content")

    //If the user clicks the same tab option twice
    if (element.classList.contains("selected")) {
        //Deselect tab option and close everything
        element.classList.remove("selected")
        displayElement.style.maxHeight = displayElement.style.paddingTop = "0"

    } else {
        //Change tab options
        disableElement.classList.remove("selected")
        disableContent.style.display = "none"
        //Resize content
        currentContent.style.display = "flex"
        displayElement.style.paddingTop = "4em"
        element.classList.add("selected")
        refreshEventGroupHeight(currentContent)
    }
}

/*
Expands/collpases the other past events section
*/
function toggleOtherPastEvents(element, display, boundary){
    let displayElement = document.getElementById(display);
    let boundaryElement = document.getElementById(boundary)

    if(element.classList.contains("selected")){
        displayElement.style.height= displayElement.style.paddingTop = displayElement.style.paddingBottom = "0"
        element.classList.remove("selected")
    }else{
        displayElement.style.height = boundaryElement.scrollHeight + "px"
        displayElement.style.paddingTop = "4em"
        element.classList.add("selected")
    }
}

/*
Updates the height of the event groups when an event card is expanded/collapsed
*/
function refreshEventGroupHeight(eventGroup, eventCardAddition = 0) {
    let displayElement = null;
    let current = eventGroup;

    do {
        if (current.classList.contains("event-group")) {
            displayElement = current;
        } else {
            current = current.parentElement;
        }
    } while (displayElement == null)

    displayElement.style.maxHeight = (eventGroup.scrollHeight + eventCardAddition) + "px"
    displayElement.style.height = (eventGroup.scrollHeight + eventCardAddition) + "px"
}


