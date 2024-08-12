function dropdown(toggleElement){
    let contentElement = toggleElement.nextElementSibling
    let expandedElementLimit = 200

    if(toggleElement.classList.contains("selected")){
        toggleElement.classList.remove("selected")
        if(toggleElement.parentElement.parentElement.classList.contains("expandable")){
            expand(toggleElement.parentElement, -expandedElementLimit)
        }
        contentElement.style.maxHeight = 0 + "px";
    }else{
        toggleElement.classList.add("selected")
        if(contentElement.parentElement.parentElement.classList.contains("expandable")){
            expand(toggleElement.parentElement, expandedElementLimit)
        }
        contentElement.style.maxHeight= contentElement.scrollHeight + "px"

    }

    function expand(element, amount){
        element.style.width = (element.clientWidth + amount) + "px"
    }

}