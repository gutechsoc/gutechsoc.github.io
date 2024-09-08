# Removing Old Events
Find the event you want to remove in eventsList.json and delete its entry, also delete the HTML file it linked to

# Adding new Events
1. Place the image for the event into the images/event folder
2. Make a copy of template.html naming it whatever you want and place it into the events/html folder
3. Fill in the title, date, location, and image of the event
4. In events/eventList.json add a new entry for the event
   1. Pick either codeolympics, dyhtguts, or other section
   2. Create a new line at the top of the section with: 
   
      `{"html": "[NAME OF HTML FILE IN /events/html]", "date": [DATE OF EVENT FORMATTED AS YYYMMDD], "time": [TIME OF THE EVENT FORMATTED AS HHMM]},`
   3. Fill in the details
5. Done!
