let someMemberOpen = false

function membersDropdown(element){
    // Gets list of currently selected members and deselects them before calling dropdown
    collapseAllMembers()
    dropdown(element);
}

// Expands the info section of a selected member
function expandMember(element) {

    // One board member expanded at a time
    // Adds delay to allow other elements to collapse to avoid card jumping between lines
    let timeDelay = 0;
    let member = element.parentElement

    if (someMemberOpen && !member.classList.contains("selected")) {
        timeDelay = 300
        collapseAllMembers()
    }
    setTimeout(function(){
        if (member.classList.contains("selected")) {
            member.classList.remove("selected")
        } else {
            member.classList.add("selected")
            someMemberOpen = true
    }},timeDelay)
}

// Collapses the info section of any selected members
function collapseAllMembers(){
    let selectedMembers = document.querySelectorAll(".member.selected .mugshot")
    if(selectedMembers.length > 0){
        Array.from(selectedMembers).forEach(member => {
            member.parentElement.classList.remove("selected");
        })
    }
    someMemberOpen=false
}