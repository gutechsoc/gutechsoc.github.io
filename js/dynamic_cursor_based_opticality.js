document.addEventListener("mousemove" , (cursor) => {
    let cursorPos = [cursor.clientX,cursor.clientY]
    let threshold= 40
    let elmOffsetX = 0
    let elmOffsetY = 0
    let elm = document.querySelectorAll(".cursor-opticality-object")

    elm.forEach((e) =>{
        let relPoz = e.getBoundingClientRect()
        
    })

})