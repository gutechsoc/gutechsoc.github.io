document.addEventListener("mousemove", (cursor) => {
    let cursorTOffset = -15
    let cursorBOffset = -25
    let cursorX = cursor.clientX
    let cursorY = cursor.clientY
    let glowT = document.querySelector('.cursor-glow-top');
    let glowB = document.querySelector('.cursor-glow-bottom');
    glowT.style.left = (cursorX + cursorTOffset) + 'px'
    glowT.style.top = (cursorY + cursorTOffset) + 'px'
    glowB.style.left = (cursorX + cursorBOffset) + 'px'
    glowB.style.top = (cursorY + cursorBOffset) + 'px'
})
