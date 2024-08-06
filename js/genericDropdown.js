function dropdown(toggleElement){
    let contentElement = toggleElement.nextElementSibling

    if(toggleElement.classList.contains("selected")){
        toggleElement.classList.remove("selected")
        contentElement.style.maxHeight = 0 + "px";
    }else{
        toggleElement.classList.add("selected")
        contentElement.style.maxHeight= contentElement.scrollHeight + "px"
    }
}