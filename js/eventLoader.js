let upcoming = {"targetElement": null, "numEventsAdded": 0, "id": "upcoming"};
let codeolympics = {"targetElement": null, "numEventsAdded": 0, "id": "codeolympics"};
let dyhtguts = {"targetElement": null, "numEventsAdded": 0, "id": "dyhtguts"};
let other = {"targetElement": null, "numEventsAdded": 0, "id": "other"};

let eventsList = { "upcoming": [], "codeolympics": [], "dyhtguts": [], "other": [] };
let sponsors = [];


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
        console.log("adding load more button" + eventSection["id"]);
        eventSection["targetElement"].innerHTML += `<button class="load-events-button" onclick="loadMoreEvents('${eventSection["id"]}', 2)">Load More</button>`
    }
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
    other["targetElement"] = document.getElementById('other-events-list');

    // Load three events of each category
    addEvents(upcoming, 3)
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

// Show CodeOlympics, hide DYHTGUTS: toggleEventGroup(this, 'codeolympics-events-list', 'dyhtguts')
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

function toggleOtherPastEvents(element, display, boundary){
    let displayElement = document.getElementById(display);
    let boundaryElement = document.getElementById(boundary)

    if(element.classList.contains("selected")){
        element.classList.remove("selected")
        displayElement.style.height= displayElement.style.paddingTop = displayElement.style.paddingBottom = "0"
    }else{
        element.classList.add("selected")
        displayElement.style.height = boundaryElement.scrollHeight + "px"
        displayElement.style.paddingTop = "4em"
    }
}
