function dropdown(toggleElement){
    const container = toggleElement.closest('.gen-drop-container');
    const content   = toggleElement.nextElementSibling;

    if (container.classList.contains('is-open')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        requestAnimationFrame(() => {
            content.style.maxHeight = '0px';
            container.classList.remove('is-open');
            toggleElement.classList.remove('selected');
        });
    } else {
        container.classList.add('is-open');
        toggleElement.classList.add('selected');
        content.style.maxHeight = '0px';
        requestAnimationFrame(() => {
            content.style.maxHeight = content.scrollHeight + 'px';
        });
    }
}
