const EditorEngine = (function()
{
    const HTML_TAGS =
    {
        bold: { open: '<b>', close: '</b>' },
        italic: { open: '<i>', close: '</i>' },
        strike: { open: '<del>', close: '</del>' },
        underline: { open: '<u>', close: '</u>' }
    };

    let state =
    {
        plainText: '',
        formattingMeta: []
    };

    function renderHTML()
    {
        let html = state.plainText;
        const sortedMeta = [...state.formattingMeta].sort((a, b) => b.end - a.end || b.start - a.start);
        
        for (const tag of sortedMeta)
        {
            const format = HTML_TAGS[tag.type];
            if (!format) continue;
            html = html.slice(0, tag.end)   + format.close + html.slice(tag.end);
            html = html.slice(0, tag.start) + format.open  + html.slice(tag.start);
        }

        return html;
    }

    function load(text, meta)
    {
        state.plainText = text;
        state.formattingMeta = meta;
    }

    function getState()
    { return state; }

    function updateText(text)
    { state.plainText = text; }

    function shiftMeta(cursorPosition, delta)
    {
        for (const tag of state.formattingMeta)
        {
            if (tag.start >= cursorPosition) tag.start += delta;
            if (tag.end   >= cursorPosition) tag.end   += delta;
        }

        state.formattingMeta = state.formattingMeta.filter(t => t.start < t.end);
    }

    function applyFormat(type, start, end)
    {
        if (start === end) return;
        const coverIdx = state.formattingMeta.findIndex(t => t.type === type && t.start <= start && t.end >= end);

        if (coverIdx !== -1)
        {
            const covering = state.formattingMeta.splice(coverIdx, 1)[0];
            if (covering.start < start) state.formattingMeta.push({ type, start: covering.start, end: start });
            if (covering.end > end) state.formattingMeta.push({ type, start: end, end: covering.end });
            return;
        }

        state.formattingMeta.push({ type, start, end });
    }

    

    
    
    return { renderHTML, load, getState, applyFormat, shiftMeta, updateText };
})();
