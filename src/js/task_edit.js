const TaskEditor = (function()
{
    const overlay = document.getElementById('editor-overlay');
    const titleInput = document.getElementById('editor-title');
    const contentArea = document.getElementById('editor-area');
    const timeInput = document.getElementById('editor-time');
    let currentId = null;

    function open(id = null, title = '', content = '', dueDate = '')
{
        currentId = id;
        titleInput.value = title;
        timeInput.value = dueDate;
        const deserialized = MdParser.deserialize(content);
        EditorEngine.load(deserialized.plainText, deserialized.formattingMeta);
        contentArea.innerText = deserialized.plainText;
        overlay.classList.remove('none');
    }

    function close()
    {
        overlay.classList.add('none');
        currentId = null;
        titleInput.value = '';
        timeInput.value = ''; 
        contentArea.innerText = '';
    }

    function save()
    {
        const savedLang = localStorage.getItem('lang') || 'ENG';
        const title = titleInput.value.trim() || translations[savedLang].untitled;
        const content = contentArea.innerText || translations[savedLang].nocontent;
        const id = currentId || Date.now();

        const now = new Date();
        const dueDate = timeInput.value || new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        const newMd =
`---
id: ${id}
status: new
dueDate: ${dueDate}
---
# ${title}
${content}`;

        if (currentId) TaskStore.update(id, newMd);
        else TaskStore.add(newMd);

        close();
        if (typeof renderGrid === 'function') renderGrid();
    }
    
    document.getElementById('editor-save').addEventListener('click', () => {
        save();
        closeTaskCard(); 
});

    return { open, close, save };
})();
