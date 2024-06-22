document.addEventListener("DOMContentLoaded", loadNoteList);

let currentNoteId = null;
const editor = new EditorJS({
    placeholder: 'Your content',
    holder: 'editorjs',
    tools: {
        header: {
            class: Header,
            inlineToolbar: ['link', 'marker', 'bold', 'italic'],
        },
        image: SimpleImage,
        list: {
            class: NestedList,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            },
        },
        quote: Quote,
        code: CodeTool,
        Marker: {
            class: Marker
        },
        table: {
            class: Table,
            inlineToolbar: true,
            config: {rows: 2, cols: 2,}
        }
    },
    autofocus: false
});

function loadNoteList() {
    const stored_noteTitle = JSON.parse(localStorage.getItem('stored_noteTitle')) || [];
    const stored_noteDate = JSON.parse(localStorage.getItem('stored_noteDate')) || [];

    const noteList = document.getElementById('note-list-block');
    noteList.innerHTML = '';
    if (stored_noteTitle.length > 0) {
        stored_noteTitle.forEach((noteTitle, index) => {
            var noteDate = stored_noteDate[index]
            const button = document.createElement('button')
            button.type = 'button'
            button.className = 'w-full text-neutral-200 text-left px-4 py-2 rounded bg-transparent hover:bg-neutral-900 transition'
            button.innerHTML = noteTitle
            button.innerHTML = `<p class="truncate font-semibold">${noteTitle}</p><p class="text-xs font-light">${noteDate}</p>`
            button.onclick = () => loadNoteContent(index)
            noteList.appendChild(button);
        });
    }
}

function loadNoteContent(index) {
    const stored_noteTitle = JSON.parse(localStorage.getItem('stored_noteTitle')) || [];
    const stored_noteContent = JSON.parse(localStorage.getItem('stored_noteContent')) || [];

    if (stored_noteTitle.length > 0 && stored_noteContent.length > 0 && typeof stored_noteTitle[index] !== 'undefined' && typeof stored_noteContent[index] !== 'undefined') {
        currentNoteId = index;
        const title = stored_noteTitle[index]
        const content = stored_noteContent[index]
        const noteTitle = document.getElementById('note-title')
        noteTitle.value = title
        editor.render(content);
    } else {
        alert('No note found')
    }
}

function saveNote() {
    const noteTitle = document.getElementById('note-title').value
    editor.save().then((content) => {
        content.blocks = content.blocks.map(block => {
            if (block.data.text) {block.data.text = block.data.text.trim();}
            if (block.type === 'header' && block.data.text) {block.data.text = block.data.text.trim();}
            if (block.type === 'list' && block.data.items) {block.data.items = block.data.items.map(item => item.trim());}
            if (block.type === 'quote' && block.data.text) {block.data.text = block.data.text.trim();}
            if (block.type === 'code' && block.data.code) {block.data.code = block.data.code.trim();}
            return block;
        });
        const noteDate = getCurrentDateFormatted()
        if (content.blocks.length > 0 && noteTitle != '') {
            let stored_noteTitle = JSON.parse(localStorage.getItem('stored_noteTitle')) || [];
            let stored_noteDate = JSON.parse(localStorage.getItem('stored_noteDate')) || [];
            let stored_noteContent = JSON.parse(localStorage.getItem('stored_noteContent')) || [];

            if (currentNoteId !== null) {
                stored_noteTitle[currentNoteId] = noteTitle;
                stored_noteDate[currentNoteId] = noteDate;
                stored_noteContent[currentNoteId] = content;
            } else {
                var newNoteIndex = stored_noteTitle.push(noteTitle) - 1;
                currentNoteId = newNoteIndex;
                stored_noteDate.push(noteDate);
                stored_noteContent.push(content);
            }

            localStorage.setItem('stored_noteTitle', JSON.stringify(stored_noteTitle));
            localStorage.setItem('stored_noteDate', JSON.stringify(stored_noteDate));
            localStorage.setItem('stored_noteContent', JSON.stringify(stored_noteContent));
            loadNoteList();
        } else {
            alert('Note title and content must not be empty')
        }
    }).catch((error) => {
        console.log(error)
    });
}

function resetNote() {
    const noteTitle = document.getElementById('note-title');
    noteTitle.value = '';
    editor.clear();
}

function deleteNote() {
    if (currentNoteId !== null) {
        let stored_noteTitle = JSON.parse(localStorage.getItem('stored_noteTitle')) || [];
        let stored_noteDate = JSON.parse(localStorage.getItem('stored_noteDate')) || [];
        let stored_noteContent = JSON.parse(localStorage.getItem('stored_noteContent')) || [];
        
        stored_noteTitle.splice(currentNoteId, 1);
        stored_noteDate.splice(currentNoteId, 1);
        stored_noteContent.splice(currentNoteId, 1);

        localStorage.setItem('stored_noteTitle', JSON.stringify(stored_noteTitle));
        localStorage.setItem('stored_noteDate', JSON.stringify(stored_noteDate));
        localStorage.setItem('stored_noteContent', JSON.stringify(stored_noteContent));

        currentNoteId = null;
        resetNote()
        loadNoteList();
    }
}

function getCurrentDateFormatted() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const year = date.getFullYear();
    const month = monthNames[date.getMonth()];
    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
}