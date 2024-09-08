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

## Editing Sponsors Marquee
The sponsors marquee achieves the infinite scrolling effect by splitting a specific number of sponsors into two groups
and then having these groups of sponsor logos scroll by with a specific delay.

To change the sponsors that appear in the marquee, enter the sponsor logo **CLASS NAME** into the array in `sponsorsSection.js`
inside the `getMarqueeSponsors()` function. Bellow is an example:

    function getMarqueeSponsors(){
        return ["amzn","barclays","broadridge","compsoc","craneware","cyberpro","dogfish","dsg","ef","github","dominos","cooper_software"]
    }


## Adding Sponsors to the Marque
Sponsors need to be in multiples of 4 so equal numbers of sponsors are distributed across all marquee subsections equally.
This allows all marquee subsections to have equal(ish) length. This is important for maintaining the seamless nature of the infinite marquee.

If you change the length of the sponsors selected, then you may wish to change the speed at which the marquee scrolls.
This can be done within  `default.css`. For each secondary sub section of top or bottom marquee, there should be a delay that
is half the animation speed of the marquee scroll animation chosen.

Notice the delay on `sponsors-top-marquee-two` (7.5s) is half the animation time (15s).


    #sponsors-top-marquee-one{
        z-index: 1;
        animation: marquee 15s infinite linear 0s;
    }
    
    #sponsors-top-marquee-two{
        z-index: 2;
        translate: -100%;
        position: relative;
        animation: marquee 15s infinite linear 7.5s;
    }

The same applies to both top and bottom marquees.