function membersDropdown(element){
    // Gets list of currently selected members and deselects them before calling dropdown
    let selectedMembers = document.querySelectorAll(".member.selected .mugshot")
    if(selectedMembers.length > 0){
        Array.from(selectedMembers).forEach(member => {
            expandMember(member)
        })
    }
    dropdown(element)

}

function expandMember(element){
    // Expands and retracts board member info
    let member = element.parentElement
    let memberInfo = element.nextElementSibling
    if(member.classList.contains("selected")){
        memberInfo.style.maxWidth = 0
        member.classList.remove("selected")
    }else{
        member.classList.add("selected")
        memberInfo.style.maxWidth = 200 + "px";
    }
}
