let upcoming = {"targetElement": null, "numEventsAdded": 0, "id": "upcoming"};
let codeolympics = {"targetElement": null, "numEventsAdded": 0, "id": "codeolympics"};
let dyhtguts = {"targetElement": null, "numEventsAdded": 0, "id": "dyhtguts"};
let other = {"targetElement": null, "numEventsAdded": 0, "id": "other"};

let eventsList = { "upcoming": [], "codeolympics": [], "dyhtguts": [], "other": [] };

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
        content += await getRequest(window.location.origin + '/events/' + eventsList[eventSection["id"]][i]["html"]);
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

    // Get a list of all events
    addEventToList((await getRequest(window.location.origin + '/events/eventsList.json')));

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
    // Format date to filter out upcoming events
    let tempDate = new Date().toISOString();
    let currentDate = `${tempDate.slice(0, 4)}${tempDate.slice(5, 7)}${tempDate.slice(8, 10)}`;
    console.log((new Date()).toUTCString())
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
    groupElement = document.getElementById(group);
    // Toggle sected colours and vidibility of event group
    if (groupElement.style.display !== 'block') { // If not visible, make visible
        groupElement.style.maxHeight = 0
        groupElement.style.display = "block";
        element.style.background = "var(--selected-background-colour)"
        groupElement.style.maxHeight = groupElement.scrollHeight + "px"
    }
    else{
        groupElement.style.display= null;
        element.style.background = "var(--card-background-colour)"
    }

    // If codeolypics is clicked, ensure dyhtguts is hidden and vice versa, N/A for other events
    if (disable !== null) {
        document.getElementById(`${disable}-tab-option`).style.background = "var(--card-background-colour)";
        let disabledEventList = document.getElementById(`${disable}-events-list`);
        for(let child of disabledEventList.children){
            if(child.classList.contains("selected")){
                toggleEventDetails(child.firstElementChild)
            }
        }
        disabledEventList.style.display = null
    }
}