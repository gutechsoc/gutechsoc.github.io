function membersDropdown(element){
    // addition to max height in px
    let heightExpansionBuffer = 450
    // Gets list of currently selected members and deselects them before calling dropdown
    let selectedMembers = document.querySelectorAll(".member.selected .mugshot")
    if(selectedMembers.length > 0){
        Array.from(selectedMembers).forEach(member => {
            expandMember(member)
        })
    }
    dropdown(element)
    //adds an extra px of length to max height to account for members info expanding
    if(element.classList.contains("selected")){
        element.nextElementSibling.style.maxHeight = element.nextElementSibling.scrollHeight + heightExpansionBuffer +"px"
    }

}

function expandMember(element){
    // Expands and retracts board member info
    let member = element.parentElement
    if(member.classList.contains("selected")){
        member.classList.remove("selected")
    }else{
        member.classList.add("selected")
    }
}
