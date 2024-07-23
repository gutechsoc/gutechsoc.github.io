# How Sponsors Work
When events are added to the DOM, JavaScript will retrieve the list of sponsors for the event from the classes of the sponsors section.
For each sponsor, it will then add a logo with a link to the sponsors' website to the event.
# Adding New Sponsors
1. Copy their logo image to the "sponsors/logos" folder
2. Open "sponsors/sponsors.json"
3. Create a new entry
4. Done!

## Creating Entries in sponsors.json
The JSON file assigns the HTML class to the sponsors' details.
It is formatted as: 

    "[CLASS NAME]": { 
        "name": "[SPONSORS' NAME]", 
        "url": "[SPONSORS' WEBSITE]",
        "logo": "[FILENAME OF LOGO]"
    }

If we were to add Amazon as a sponsor, then we could shorten their name to "amzn" to use as the class name:
    
    "amzn" : {

We could leave their name as "Amazon":

    "amzn" {
        "name": "Amazon",

We could use https://amazon.co.uk as their website if they didn't give us one: 

    "amzn" {
        "name": "Amazon",
        "url": "https://amazon.co.uk",

Finally, we would put their logo in the logos folder, and add the name of the file

    "amzn" {
        "name": "Amazon",
        "url": "https://amazon.co.uk",
        "logo": "amazon_logo.png"
    }