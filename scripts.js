document.addEventListener("DOMContentLoaded", loadMarkdowns);
document.getElementById('editor').addEventListener('paste', handlePaste);
let currentMarkdownId = null;

function formatText(command) {
    document.execCommand(command, false, null);
    const ul_list = document.querySelectorAll('ul');
    const ul_array = [...ul_list];
    ul_array.forEach(ul => {
        ul.classList.add('list-disc', 'list-inside')
    });
    const ol_list = document.querySelectorAll('ol');
    const ol_array = [...ol_list];
    ol_array.forEach(ol => {
        ol.classList.add('list-decimal', 'list-inside')
    });
}

function createTable() {
    const rows = prompt("Enter number of rows:");
    const cols = prompt("Enter number of columns:");
    if (rows > 0 && cols > 0) {
        let table = "<table class='table-auto'>";
        for (let i = 0; i < rows; i++) {
            table += "<tr>";
            for (let j = 0; j < cols; j++) {
                table += "<td class='border border-neutral-500 p-2'></td>";
            }
            table += "</tr>";
        }
        table += "</table><div></div>";
        document.execCommand('insertHTML', false, table);
    }
}

function formatQuote() {
    const quote = prompt("Enter quote text:");
    if (quote) {
        const quoteHTML = `<div class="flex"><blockquote class="bg-neutral-800 rounded px-2 py-1 border-l-8 border-indigo-600 font-quote italic">&ldquo;${quote}&rdquo;</blockquote></div><div></div>`;
        document.execCommand('insertHTML', false, quoteHTML);
    }
}

function formatCode() {
    const code = prompt("Enter code:");
    if (code) {
        const codeHTML = `<div class="mb-1 bg-neutral-800 text-white rounded px-4 py-2 font-mono">${code}</div><div></div>`;
        document.execCommand('insertHTML', false, codeHTML);
    }
}

function changeFontSize() {
    const size = prompt("Enter font size (1-7):");
    document.execCommand('fontSize', false, size);
}

function highlightText() {
    const color = prompt("Enter highlight color (e.g., yellow):");
    document.execCommand('hiliteColor', false, color);
}

function cancelSaveMarkdown() {
    document.getElementById('editor').innerHTML = '';
    document.getElementById('editor-title').value = '';
    window.dispatchEvent(
        new CustomEvent('modal-editor-close', {detail: {id: 'modal-editor'}})
    )
}

function saveMarkdown() {
    const title = document.getElementById('editor-title').value;
    const content = document.getElementById('editor').innerHTML;
    if (!title) return alert("Cannot save empty title.");
    if (!content) return alert("Cannot save empty content.");
    let markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    let titles = JSON.parse(localStorage.getItem('titles')) || [];
    if (currentMarkdownId !== null) {
        markdowns[currentMarkdownId] = content;
        titles[currentMarkdownId] = title;
    } else {
        markdowns.push(content);
        titles.push(title);
    }
    localStorage.setItem('markdowns', JSON.stringify(markdowns));
    localStorage.setItem('titles', JSON.stringify(titles));
    document.getElementById('editor').innerHTML = '';
    document.getElementById('editor-title').value = '';
    document.getElementById('editor-title').readOnly = false
    document.getElementById('editor-title').classList.remove('cursor-not-allowed', 'bg-gray-100')
    currentMarkdownId = null;
    window.dispatchEvent(
        new CustomEvent('modal-editor-close', {detail: {id: 'modal-editor'}})
    )
    loadMarkdowns();
}

function emptyNoteList() {
    const emptyNoteListContainer = document.getElementById('empty-note-list');
    emptyNoteListContainer.classList.remove('hidden')
    emptyNoteListContainer.classList.add('flex')
}

function nonEmptyNoteList() {
    const emptyNoteListContainer = document.getElementById('empty-note-list');
    emptyNoteListContainer.classList.remove('flex')
    emptyNoteListContainer.classList.add('hidden')
}

function loadMarkdowns() {
    const titles = JSON.parse(localStorage.getItem('titles')) || [];
    const markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    const noteList = document.getElementById('note-list');
    emptyNoteList()
    noteList.innerHTML = '';
    
    if (markdowns.length > 0) {
        nonEmptyNoteList()
        markdowns.forEach((markdown, index) => {
            const noteButton = document.createElement('button')
            noteButton.type = 'button'
            noteButton.className = 'w-full hover:bg-neutral-800 rounded px-2 py-1 font-semibold text-sm text-left transition'
            noteButton.innerHTML = titles[index]
            noteButton.onclick = () => viewMarkdown(index)
            noteList.appendChild(noteButton);
        });
    }
}

function viewMarkdown(index) {
    const markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    
    if (markdowns.length > 0) {
        currentMarkdownId = index;
        document.getElementById('markdown-content').innerHTML = markdowns[index];
        document.getElementById('editor').innerHTML = '';
        document.getElementById('editor-title').value = '';
        document.getElementById('editor-title').readOnly = false
        document.getElementById('editor-title').classList.remove('cursor-not-allowed', 'bg-gray-100')
        document.getElementById('markdown-viewer').classList.remove('hidden');
    }
}

function editMarkdown() {
    const markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    const titles = JSON.parse(localStorage.getItem('titles')) || [];
    document.getElementById('editor').innerHTML = markdowns[currentMarkdownId];
    document.getElementById('editor-title').value = titles[currentMarkdownId];
    document.getElementById('editor-title').readOnly = true
    document.getElementById('editor-title').classList.add('cursor-not-allowed', 'bg-gray-100')
    document.getElementById('markdown-viewer').classList.add('hidden');
    window.dispatchEvent(
        new CustomEvent('modal-editor-open', {detail: {id: 'modal-editor'}})
    )
}

function deleteMarkdown() {
    let markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    let titles = JSON.parse(localStorage.getItem('titles')) || [];
    markdowns.splice(currentMarkdownId, 1);
    titles.splice(currentMarkdownId, 1);
    localStorage.setItem('markdowns', JSON.stringify(markdowns));
    localStorage.setItem('titles', JSON.stringify(titles));
    document.getElementById('markdown-content').innerHTML = '';
    document.getElementById('editor-title').value = '';
    document.getElementById('markdown-viewer').classList.add('hidden');
    currentMarkdownId = null;
    loadMarkdowns();
}

function insertLink() {
    const url = prompt("Enter the URL:");
    const text = prompt("Enter the text for the link:");
    if (url && text) {
        const linkHTML = `<a href="${url}" target="_blank" class="text-blue-400 hover:text-blue-500 transition underline">${text}</a>`;
        document.execCommand('insertHTML', false, linkHTML);
    }
}

function handlePaste(e) {
    setTimeout(function() {
        const editor = e.target
        const imgs = editor.querySelectorAll('img')
        const img_array = [...imgs]
        img_array.forEach(img => {
            img.classList.add('object-cover', 'rounded-lg', 'border', 'border-neutral-900')
        })
    }, 300);
}
