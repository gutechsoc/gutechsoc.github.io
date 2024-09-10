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
Search the index.html for the phrase `[boardmembers]`.

Editing board members required editing the different `members` elements. bellow is an example:
    
    <div class="board-members">
      <!--edit here-->
      <div class="member">
          <div class="mugshot" onclick="expandmember(this)">
              <img src="images/about_us/board_memebers/xyz.webp" alt="your mug here">
          </div>
          <div class="info">
              <p class="role">general assistant</p>
              <p class="name"> john smith</p>
              <a class="linked-in" href="https://www.linkedin.com">linkedin</a>
          </div>
      </div>
    </div>

to change the:
 * Profile picture (mugshot) of the board member: change the source for the `<img>` element inside of the `mugshot` class element.
 * Role: change the text inside the `<p>` element with the `role` class tag to the role of the board member.
 * Name displayed for the board member: change the text inside the `<p>` element with the `name` class tag to the name of the board member.
 * LinkedIn link destination: Change the `href` value of the `<a>` element with the `linked-in` class tag to the link pointing to the LinkedIn profile of the board member.
   * If you change the destination of the link to something other than LinkedIn, remember to edit the text stating the destination between the `<a>` element to reflect this change.

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