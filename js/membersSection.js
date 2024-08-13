function membersDropdown(element){
    let selectedMembers = document.querySelectorAll(".member.selected .mugshot")
    console.log(selectedMembers)
    if(selectedMembers.length > 0){
        Array.from(selectedMembers).forEach(member => {
            expandMember(member)
        })
    }
    dropdown(element)

}

function expandMember(element){
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
