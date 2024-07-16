let codeolympics = {"targetElement": null, "numEventsAdded": 0, "id": "codeolympics"};
let dyhtguts = {"targetElement": null, "numEventsAdded": 0, "id": "dyhtguts"};
let other = {"targetElement": null, "numEventsAdded": 0, "id": "other"};

let eventsList = null;

// Called on page load to setup the global variables and display 3 of each event
async function eventLoader() {
    // Setup global variables
    await setup();

    // Load three events of each category
    addEvents(dyhtguts, 3);
    addEvents(codeolympics, 3);
    addEvents(other, 3);

}

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

    eventSection["targetElement"].innerHTML = content;
}

// Get requester, returns the content of the request, handles errors
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
    eventsList = await getRequest(window.location.origin + '/events/eventsList.json');
    codeolympics["targetElement"] = document.getElementById('upcoming-events');
    dyhtguts["targetElement"] = document.getElementById('minor-past-events');
    other["targetElement"] = document.getElementById('major-past-events');
}

function toggleEventDetails(element) {
    if (element.nextElementSibling.style.display !== "flex") {
        element.nextElementSibling.style.display = "flex";
    } else {
        element.nextElementSibling.style.display = "none";
    }
}