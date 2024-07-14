// Event type = [section on the DOM, how many events have been shown, the key in eventsList.json]
let codeolympics = [null, 0, "codeolympics"];
let dyhtguts = [null, 0, "dyhtguts"];
let other = [null, 0, "other"];

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
    let startIndex = eventSection[1];

    // Dont add more events if we've exhausted them all
    if (startIndex === eventsList[eventSection[2]].length) {
        console.log(`All events have been added for ${eventSection[2]}`);
        return;
    }

    // Dont try to add more events than we have left
    if (startIndex + amount > eventsList[eventSection[2]].length) {
        amount = eventsList[eventSection[2]].length - eventSection[1];
    }

    // Grab the old list of events to append to
    content = ``;
    content += eventSection[0].innerHTML;

    // Append the requested number of events
    for (let i = startIndex ; i < startIndex + amount; i++) {
        content += await getRequest(window.location.origin + '/events/' + eventsList[eventSection[2]][i]);
        eventSection[1] += 1
    }

    eventSection[0].innerHTML = content;
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
    codeolympics[0] = document.getElementById('upcoming-events');
    dyhtguts[0] = document.getElementById('minor-past-events');
    other[0] = document.getElementById('major-past-events');
}