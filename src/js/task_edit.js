const TaskEditor = (function()
{
    const overlay = document.getElementById('editor-overlay');
    const titleInput = document.getElementById('editor-title');
    const contentArea = document.getElementById('editor-area');
    const timeInput = document.getElementById('editor-time');
    let currentId = null;

    function getAbsoluteOffset(targetNode, targetOffset)
    {
        let pos = 0;
        const walker = document.createTreeWalker(contentArea, NodeFilter.SHOW_TEXT);
        while (walker.nextNode())
        {
            if (walker.currentNode === targetNode) return pos + targetOffset;
            pos += walker.currentNode.textContent.length;
        }
        return pos;
    }

    function restoreCursor(pos)
    {
        const sel = window.getSelection();
        const walker = document.createTreeWalker(contentArea, NodeFilter.SHOW_TEXT);
        let remaining = pos;
        while (walker.nextNode())
        {
            const len = walker.currentNode.textContent.length;
            if (remaining <= len)
            {
                const range = document.createRange();
                range.setStart(walker.currentNode, remaining);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return;
            }
            
            remaining -= len;
        }
    }

    contentArea.addEventListener('input', () =>
    {
        const newText = contentArea.innerText;
        const oldText = EditorEngine.getState().plainText;
        const delta   = newText.length - oldText.length;
        const sel = window.getSelection();
        if (sel.rangeCount)
        {
            const range  = sel.getRangeAt(0);
            const cursor = getAbsoluteOffset(range.startContainer, range.startOffset);
            EditorEngine.shiftMeta(cursor - Math.max(delta, 0), delta);
        }
        EditorEngine.updateText(newText);
    });

    function handleFormat(type)
    {
        const sel = window.getSelection();

        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const start = getAbsoluteOffset(range.startContainer, range.startOffset);
        const end = getAbsoluteOffset(range.endContainer, range.endOffset);

        if (start === end) return;

        const cursorPos = end;
 
        EditorEngine.applyFormat(type, start, end);
        contentArea.innerHTML = EditorEngine.renderHTML();
        restoreCursor(cursorPos);
    }

    function handleList()
    {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
 
        const range = sel.getRangeAt(0);
        const absPos = getAbsoluteOffset(range.startContainer, range.startOffset);
        const text = EditorEngine.getState().plainText;

        const lineStart = text.lastIndexOf('\n', absPos - 1) + 1;
        const linePrefix = text.slice(lineStart, lineStart + 2);
 
        let newText;
        if (linePrefix === '- ')
        {
            newText = text.slice(0, lineStart) + text.slice(lineStart + 2);
            EditorEngine.shiftMeta(lineStart, -2);
        }
        else
        {
            newText = text.slice(0, lineStart) + '- ' + text.slice(lineStart);
            EditorEngine.shiftMeta(lineStart, 2);
        }
 
        EditorEngine.updateText(newText);
        contentArea.innerHTML = EditorEngine.renderHTML();
        restoreCursor(absPos);
    }
 
    


    function getAbsoluteCursorPosition() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return 0;
        const range = sel.getRangeAt(0);
        let position = 0;
        const walker = document.createTreeWalker(contentArea, NodeFilter.SHOW_TEXT);

        while (walker.nextNode())
        {
            if (walker.currentNode === range.startContainer)
            {
                position += range.startOffset;
                break;
            }
            position += walker.currentNode.textContent.length;
        }

        return position;
    }

    const fileInput = document.createElement('input');
    fileInput.type   = 'file';
    fileInput.accept = '.md';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
 
    fileInput.addEventListener('change', (e) =>
    {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) =>
        {
            TaskStore.add(ev.target.result);
            if (typeof renderGrid === 'function') renderGrid();
        };
        reader.readAsText(file);
        fileInput.value = '';
    });

    document.getElementById('btn-bold').addEventListener('click', () => handleFormat('bold'));
    document.getElementById('btn-italic').addEventListener('click', () => handleFormat('italic'));
    document.getElementById('btn-underline').addEventListener('click', () => handleFormat('underline'));
    document.getElementById('btn-list').addEventListener('click', handleList);
    document.getElementById('btn-import').addEventListener('click', () => fileInput.click());
    document.getElementById('btn-export').addEventListener('click', () =>
    {
        const engineState = EditorEngine.getState();
        const title = titleInput.value.trim() || 'task';
        const content = MdParser.serialize(engineState.plainText, engineState.formattingMeta);
        const id = currentId || Date.now();
        const dueDate = timeInput.value || '';
 
        const md =
`---
id: ${id}
status: new
dueDate: ${dueDate}
---
# ${title}
${content}`;
 
        const safeName = title.replace(/[^a-zA-ZА-ЯҐЄІЇа-яґєії0-9 _-]/g, '').trim() || 'task';
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}.md`;
        a.click();
        URL.revokeObjectURL(url);
    });

    function open(id = null, title = '', content = '', dueDate = '')
    {
        currentId = id;
        titleInput.value = title;
        timeInput.value = dueDate;
        const deserialized = MdParser.deserialize(content);
        EditorEngine.load(deserialized.plainText, deserialized.formattingMeta);
        contentArea.innerHTML = EditorEngine.renderHTML();
        overlay.classList.remove('none');
    }

    function close()
    {
        overlay.classList.add('none');
        currentId = null;
        titleInput.value = '';
        timeInput.value = ''; 
        contentArea.innerHTML = '';
        EditorEngine.load('', []);
    }

    function save()
    {
        const savedLang = localStorage.getItem('lang') || 'ENG';
        const title = titleInput.value.trim() || translations[savedLang].untitled;
        const engineState = EditorEngine.getState();
        const content = MdParser.serialize(engineState.plainText, engineState.formattingMeta) || translations[savedLang].nocontent;
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
