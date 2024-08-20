let someMemberOpen = false

function membersDropdown(element){
    // Gets list of currently selected members and deselects them before calling dropdown
    collapseAllMembers()
    dropdown(element);
}

function expandMember(element) {
    // Expands and retracts board member info
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


function collapseAllMembers(){
    let selectedMembers = document.querySelectorAll(".member.selected .mugshot")
    if(selectedMembers.length > 0){
        Array.from(selectedMembers).forEach(member => {
            member.parentElement.classList.remove("selected");
        })
    }
    someMemberOpen=false
}