# gutechsoc.github.io
The official website for the GU Tech Society. Hosted at www.gutechsoc.com

# Editing The Site
## Adding Events
See events/README.md

## Adding Sponsors
See sponsors/README.md

# Embedding Videos
Embedding videos would be done by manually editing `index.html`. Styling for embedded videos is handled using the `.video-embed` class with an `<iframe>` inside. Bellow is an example:

    <div class="centre disable">
        <div `class="video-embed">
            <iframe
            src="https://www.youtube.com/embed/oip-4Q2Pk0k?si=Cnq6GjO3K59oOSn_">
            </iframe>
        </div>
    </div>
Notice the `.disbale` tag on the outer div; this just sets the `display` value to `none`, effectively toggling the element.

## About Us
### Who Are We
Search the index.html for the phrase `whoarewesection` this will take you to the correct section in the html file.
A few lines 
### What Events Do We Host

### Board Members


# Development
* Static site
* Pushes get deployed to GitHub/Cloudflare pages (undecided)

## Plan
1. Design
- Get ideas into figma
- Get Ahmed + Jacksons input
- Finalise design
2. Folder structure
3. Development
4. ...
5. Done

# TODO
- Make more things bigger on mobile
- Mobile performance
  - transitions make lag on mobile
  - disable transitions on mobile
    - makes codeolympics, gyhtgs, and other events buggy
    - solution:
      - when on mobile dont expand with js, use "height: auto"