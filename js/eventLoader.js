let upcoming = {"targetElement": null, "numEventsAdded": 0, "id": "upcoming"};
let codeolympics = {"targetElement": null, "numEventsAdded": 0, "id": "codeolympics"};
let dyhtguts = {"targetElement": null, "numEventsAdded": 0, "id": "dyhtguts"};
let other = {"targetElement": null, "numEventsAdded": 0, "id": "other"};

let eventsList = null;

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
    content = ``;
    content += eventSection["targetElement"].innerHTML;

    // Append the requested number of events
    for (let i = startIndex ; i < startIndex + amount; i++) {
        content += await getRequest(window.location.origin + '/events/' + eventsList[eventSection["id"]][i]);
        eventSection["numEventsAdded"] += 1
    }

    // Update the event list
    eventSection["targetElement"].innerHTML = content;
}

// Generic get requester, returns the content of the request, handles (some) errors
async function getRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
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

    // Get a list of all events, get elements from the DOM
    eventsList = await getRequest(window.location.origin + '/events/eventsList.json');
    upcoming["targetElement"] = document.getElementById('upcoming-events-list');
    codeolympics["targetElement"] = document.getElementById('codeolympics-events-list');
    dyhtguts["targetElement"] = document.getElementById('dyhtguts-events-list');
    other["targetElement"] = document.getElementById('minor-past-events-content');

    // Load three events of each category
    addEvents(dyhtguts, 3);
    addEvents(codeolympics, 3);
    addEvents(other, 3);
}

function toggleEventDetails(element) {
    // Toggle the colour and visibility of events
    // if (element.nextElementSibling.style.display !== "flex") { // If not visible, make visible
    //     element.nextElementSibling.style.display = "flex";
    //     element.parentElement.style.background = "var(--selected-background-colour)";
    // } else { // If visible. make hidden
    //     element.nextElementSibling.style.display = "none";
    //     element.parentElement.style.background = "var(--card-background-colour)";
    // }
    let eventPar = element.parentElement;
    let eventSib = element.nextElementSibling;
    if(eventSib.className === "event-content"){
        eventPar.style.background="var(--selected-background-colour)"
        eventSib.classList.add("selected");
        eventSib.style.maxHeight = eventSib.scrollHeight + "px"
    }else{
        eventPar.style.background="var(--card-background-colour)"
        eventSib.className = "event-content"
        eventSib.style.maxHeight =  "0px"

    }
}

// Show CodeOlympics, hide DYHTGUTS: toggleEventGroup(this, 'codeolympics-events-list', 'dyhtguts')
function toggleEventGroup(element, group, disable) {
    groupElement = document.getElementById(group);

    // Toggle sected colours and vidibility of event group
    if (groupElement.style.display !== "block") { // If not visible, make visible
        groupElement.style.display = "block";
        element.style.background = "var(--selected-background-colour)";
    } else { // If visible, make hidden
        groupElement.style.display = "none";
        element.style.background = "var(--card-background-colour)";
    }

    // If codeolypics is clicked, ensure dyhtguts is hidden and vice versa, N/A for other events
    if (disable !== null) {
        document.getElementById(`${disable}-tab-option`).style.background = "var(--card-background-colour)";
        document.getElementById(`${disable}-events-list`).style.display = "none";
    }
}