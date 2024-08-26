
let sections;
let highlighted = [];


function scrollSetup() {

    sections = [
        [document.getElementById('events'), document.getElementById("nav-events")],
        [document.getElementById('about-us'), document.getElementById("nav-about-us")],
        [document.getElementById('sponsor-us'), document.getElementById("nav-sponsor-us")],
        [document.getElementById('join-us'), document.getElementById("nav-join-us")]
    ]

    addEventListener("scroll", navHighlights)
    addEventListener("orientationchange", navHighlights)
    addEventListener("transitionend", navHighlights)
    addEventListener("transitioncancel", navHighlights)
    navHighlights()

}

function navHighlights() {

    // If the section is within 50% of the window, highlight the navigation element
    // Cutoff is top 50% if at the top of the page, middle 50% if in the middle and bottom 50% if at the bottom of the page
        let documentHeightExtreme = 20
        let windowHeight = window.visualViewport.height
        let documentHeight = document.body.scrollHeight
        let topCutOff = 0;
        let bottomCutOff = 0

        if(window.scrollY < documentHeightExtreme){
            topCutOff = 0
            bottomCutOff = windowHeight/2
        }else if((windowHeight + window.scrollY) - documentHeight > 0){
            topCutOff = windowHeight/2
            bottomCutOff = documentHeight
        }else{
            topCutOff = (window.visualViewport.height / 2) - (window.visualViewport.height / 4)
            bottomCutOff = (window.visualViewport.height / 2) + (window.visualViewport.height / 4)
        }


    sections.forEach(section => {
        boundingBox = section[0].getBoundingClientRect()

        if (boundingBox.bottom > topCutOff && boundingBox.top < bottomCutOff) {
            section[1].classList.add("highlight")
        } else {
            section[1].classList.remove("highlight")
        }
    })

    if (window.scrollY === 0) {
        document.getElementsByClassName("logo")[0].classList.add("logo-top")
    } else {
        document.getElementsByClassName("logo")[0].classList.remove("logo-top")
    }
    // console.log("test");
    // scrollHeight = window.scrollY;
    // // bottomScrollHeight = scrollHeight + window.innerHeight;
    // sections.forEach(section => {
    //     boundingBox = section[0].getBoundingClientRect()
    //     section[0].scroll
    //     if (boundingBox.top < 0 && boundingBox.bottom > 0) {
    //         console.log("highlighting: " + section[1].id)
    //         highlighted.forEach(highlight => {
    //             console.log("clearing: " + highlight.id)
    //             highlight.classList.remove("highlight");
    //             highlighted.pop()
    //         })
    //         section[1].classList.add("highlight");
    //         highlighted.push(section[1])
    //     } else {
    //         section[0]
    //     }
    // })
    //
    // if (scrollHeight === 0) {
    //
    // }

}