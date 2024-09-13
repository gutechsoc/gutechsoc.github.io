# gutechsoc.github.io
The official website for the GU Tech Society. Hosted at www.gutechsoc.com

# WEBP Image Conversion
The WEBP image conversion has two parts it simultaneously converts any png, jpg, or jpeg to a webp while retaining the original file in the /images/.original-files folder.
Secondly, it searches every html, css, js, and json file and replaces any png, jpeg, or jpg file references with its webp counterpart.

This is done as a GitHub action and should be transparent to you. You do not need to do anything to trigger this, it runs automatically on every push.

# Editing The Site
We advise you to use an editor that:
- Does not wrap text as the SVG files at the top of the page have to be raw in the HTML to allow for color and path manipulation.
- Has a search functionality to find specific sections.

## Adding Events
See events/README.md

## Adding Sponsors
See sponsors/README.md

## Embedding Videos
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
Search the index.html for the phrase `whoarewesection`.
A few lines below you will find a comment saying "Edit here", place or edit the content underneath the comment.

### What Events Do We Host
Search the index.html for the phrase `whateventdowehostsection`.
A few lines below you will find a comment saying "Edit here", place or edit the content underneath the comment.

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

## Sponsor Us
### General content
Search the index.html file for the phrase `sponsoruscontentsection`.
Edit below the comment.

### Email Link
Below the General Content div, there is another div that contains the email link.

### Sponsors Marquee
See sponsors/README.md

## Join Us
### Content
Search index.html for the phrase `join-us-content`, edit the content of the child section below this

### Links
Search index.html for the phrase `join-us-links`, the SRC and Discord links are below this
