
let sections;
let highlighted = [];


function scrollSetup() {

    sections = [
        [document.getElementById('events'), document.getElementById("nav-events")],
        [document.getElementById('about-us'), document.getElementById("nav-about-us")],
        [document.getElementById('sponsor-us'), document.getElementById("nav-sponsor-us")],
        [document.getElementById('join-us'), document.getElementById("nav-join-us")]
    ]

    addEventListener("scroll", function() {

        // If the section is within 50% of the window centered in the middle, highlight the navigation element
        windowHeight = window.visualViewport.height
        console.log(windowHeight);
        topCutOff = (window.visualViewport.height / 2) - (window.visualViewport.height / 4)
        bottomCutOff = (window.visualViewport.height / 2) + (window.visualViewport.height / 4)

        sections.forEach(section => {
            boundingBox = section[0].getBoundingClientRect()

            if (boundingBox.bottom > topCutOff && boundingBox.top < bottomCutOff) {
                section[1].classList.add("highlight")
            } else {
                section[1].classList.remove("highlight")
            }
        })
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

    });
}