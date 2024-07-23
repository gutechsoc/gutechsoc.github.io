let upcoming = {"targetElement": null, "numEventsAdded": 0, "id": "upcoming"};
let codeolympics = {"targetElement": null, "numEventsAdded": 0, "id": "codeolympics"};
let dyhtguts = {"targetElement": null, "numEventsAdded": 0, "id": "dyhtguts"};
let other = {"targetElement": null, "numEventsAdded": 0, "id": "other"};

let eventsList = { "upcoming": [], "codeolympics": [], "dyhtguts": [], "other": [] };

let sponsors = [];

// Add X amounts of events to a section
async function addEvents(eventSection, amount) {
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
        content += await getRequest('events/html/' + eventsList[eventSection["id"]][i]["html"]);;
        eventSection["numEventsAdded"] += 1
    }

    // Update the event list
    eventSection["targetElement"].innerHTML = content;

    // The events have to be in the DOM before we can add the sponsors
    setupSponsors();
}

function setupSponsors() {
    // Add sponsors to events
    // Loop for each event that hasnt had sponsors setup
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
            content += `<a href='${sponsors[classItem]["url"]}'>`; // Link open
            content += `<img src='sponsors/logos/${sponsors[classItem]['logo']}' alt='${sponsors[classItem]["name"]}'/>`; // Image
            content += `</a>`; // Link close
        }

        // Close the scrolling tag
        content += `</marquee>`;

        // Add the permanent class
        sponsorSection.classList.add("event-sponsors");
        sponsorSection.innerHTML = content
    }
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

async function setup() {

    // Get a list of all events
    addEventToList((await getRequest('events/eventsList.json')));

    // Get a list of all sponsors
    sponsors = await getRequest('sponsors/sponsors.json');

    // Get elements from the DOM
    upcoming["targetElement"] = document.getElementById('upcoming-events-list');
    codeolympics["targetElement"] = document.getElementById('codeolympics-events-list');
    dyhtguts["targetElement"] = document.getElementById('dyhtguts-events-list');
    other["targetElement"] = document.getElementById('minor-past-events-content');

    // Load three events of each category
    addEvents(dyhtguts, 3);
    addEvents(codeolympics, 3);
    addEvents(other, 3);
}

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
}

function toggleEventDetails(element) {
    // Toggle the colour and visibility of events
    let eventPar = element.parentElement;
    let eventSib = element.nextElementSibling;
    if(!eventPar.classList.contains("selected")){
        eventPar.style.background="var(--selected-background-colour)"
        eventPar.classList.add("selected");
        eventSib.style.maxHeight = eventSib.scrollHeight + "px"
    }else{
        eventPar.style.background="var(--card-background-colour)"
        eventSib.style.maxHeight = "0"
        eventPar.classList.remove("selected")
    }
}

// Show CodeOlympics, hide DYHTGUTS: toggleEventGroup(this, 'codeolympics-events-list', 'dyhtguts')
function toggleEventGroup(element, group, disable) {

    let currentGroupElement = document.getElementById(group);
    let disableElement = document.getElementById(disable +"-tab-option")
    let boundaryElement = document.getElementById("major-past-events-content-boundary")
    let displayElement= document.getElementById("major-past-events-tab-content")

    //If the user clicks the same tab option twice
    if(element.classList.contains("selected")){
        //Deselect tab option and close everything
        element.classList.remove("selected")
        element.style.background="var(--card-background-colour)"
        boundaryElement.style.maxHeight= displayElement.style.height = displayElement.style.paddingTop =
            displayElement.style.paddingBottom = "0"
    }else{
        //Change tab options
        disableElement.style.background = "var(--card-background-colour)"
        disableElement.classList.remove("selected")
        //Resize content
        boundaryElement.innerHTML = currentGroupElement.innerHTML
        displayElement.style.paddingTop = "4em"
        displayElement.style.paddingBottom= "2em"
        element.classList.add("selected")
        element.style.background = "var(--selected-background-colour)"
        boundaryElement.style.maxHeight = displayElement.style.height = boundaryElement.scrollHeight + "px"

    }


}
