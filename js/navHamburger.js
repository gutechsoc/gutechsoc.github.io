function expandNavSocials() {
    let menu = document.getElementById("nav-socials");
    if (menu.classList.contains("selected")) {
        menu.classList.remove("selected")
    } else {
        menu.classList.add("selected")
    }
}