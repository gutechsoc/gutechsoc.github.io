function expandMember(element){
    let member = element.parentElement
    let memberInfo = element.nextElementSibling
    if(member.classList.contains("selected")){
        member.classList.remove("selected")
        memberInfo.style.maxWidth = 0
    }else{
        member.classList.add("selected")
        memberInfo.style.maxWidth = 100 +"%";
    }
}