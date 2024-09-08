// Generic function for a dropdown element
function dropdown(toggleElement){
    // uses toggle (clickable) element to move to content element (should be next sibling)
    let contentElement = toggleElement.nextElementSibling
    if(toggleElement.classList.contains("selected")){
        toggleElement.classList.remove("selected")
        contentElement.style.maxHeight = 0 + "px";
    }else{
        toggleElement.classList.add("selected")
        contentElement.style.maxHeight= contentElement.scrollHeight + "px"
    }


}