document.addEventListener("DOMContentLoaded", loadNoteList);
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveNote();
    }
});

let currentNoteId = null;
const editor = new EditorJS({
    placeholder: 'Your note',
    holder: 'editorjs',
    config: {
        minHeight: 20,
    },
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
        quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author',
            },
        },
        code: CodeTool,
        Marker: {
            class: Marker
        },
        table: {
            class: Table,
            inlineToolbar: true,
            config: {rows: 2, cols: 2,}
        },
        checklist: {
            class: Checklist,
            inlineToolbar: true,
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
            const div = document.createElement('div')
            div.className = 'w-full text-neutral-300 hover:text-neutral-50 px-3 py-3 space-x-2 rounded-lg bg-transparent hover:bg-neutral-900/50 transition flex justify-between'
            div.innerHTML = `
                <div class="w-full flex flex-col items-start overflow-hidden">
                    <p onclick="loadNoteContent(${index})" class="truncate w-full font-bold hover:underline hover:cursor-pointer" title="View note">${noteTitle}</p>
                    <p class="text-xs">${noteDate}</p>
                </div>
                <button type="button" id="delete-note-button" onclick="deleteNote(${index})" class="w-5 h-5 flex-none flex items-center justify-center text-neutral-500 hover:text-red-500 transition" title="Delete note">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 stroke-2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>                           
                </button>
            `
            noteList.appendChild(div);
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
            alertMessage('success', 'Note saved')
        } else {
            alertMessage('danger', 'Note title and content must not be empty')
        }
    }).catch((error) => {
        alertMessage('danger', 'Unable to save note. Error message: ' + error)
    });
}

function resetNote() {
    const noteTitle = document.getElementById('note-title');
    noteTitle.value = '';
    editor.clear();
    currentNoteId = null;
}

function deleteNote(index) {
    currentNoteId = index
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
        alertMessage('info', 'Note deleted')
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

function alertMessage(type, message) {
    let theme = null
    let icon = null
    const alertMessageContainer = document.getElementById('alert-message-container')
    const div = document.createElement('div')

    if (type == 'success') {
        theme = 'border-green-500 bg-green-50 text-green-800'
        icon = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 stroke-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        `
    } else if (type == 'danger') {
        theme = 'border-red-500 bg-red-50 text-red-800'
        icon = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 stroke-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
        `
    } else {
        theme = 'border-sky-500 bg-sky-50 text-sky-800'
        icon = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 stroke-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
        `
    }

    div.className = `rounded border-s-4 ${theme} p-4 w-full max-w-sm cursor-pointer`
    div.setAttribute('x-data', true)
    div.setAttribute('x-ref', 'alertBox')
    div.setAttribute('x-on:click', '$refs.alertBox.remove()')
    div.setAttribute('role', 'alert')

    div.innerHTML = `
        <div class="flex items-start gap-2">
            ${icon}
            <strong class="block font-medium text-sm w-full">${message}</strong>
        </div>
    `
    alertMessageContainer.appendChild(div)
}