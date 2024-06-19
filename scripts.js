document.addEventListener('DOMContentLoaded', loadNotes);

let editNoteId = null;
let viewNoteId = null;

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
}

document.getElementById('editor').addEventListener('paste', function (e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                document.getElementById('editor').appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }
});

function addNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('editor').innerHTML;

    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }

    const note = {
        id: Date.now(),
        title: title,
        content: content
    };

    saveNoteToLocalStorage(note);
    appendNoteToDOM(note);

    document.getElementById('note-title').value = '';
    document.getElementById('editor').innerHTML = '';
}

function updateNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('editor').innerHTML;

    if (!title || !content) {
        alert('Please enter both title and content.');
        return;
    }

    const updatedNote = {
        id: editNoteId,
        title: title,
        content: content
    };

    updateNoteInLocalStorage(updatedNote);
    updateNoteInDOM(updatedNote);

    document.getElementById('note-title').value = '';
    document.getElementById('editor').innerHTML = '';
    document.getElementById('update-note').style.display = 'none';
    document.querySelector('.note-form button[onclick="addNote()"]').style.display = 'inline-block';

    editNoteId = null;
}

function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.forEach(note => appendNoteToDOM(note));
}

function appendNoteToDOM(note) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.setAttribute('data-id', note.id);

    const noteTitle = document.createElement('div');
    noteTitle.className = 'note-title';
    noteTitle.innerText = note.title;
    noteTitle.onclick = function () {
        viewNoteDetail(note.id);
    };

    const viewButton = document.createElement('button');
    viewButton.innerText = 'View';
    viewButton.onclick = function () {
        viewNoteDetail(note.id);
    };

    noteElement.appendChild(noteTitle);
    noteElement.appendChild(viewButton);

    document.getElementById('notes-list').appendChild(noteElement);
}

function updateNoteInLocalStorage(updatedNote) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const index = notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
        notes[index] = updatedNote;
        localStorage.setItem('notes', JSON.stringify(notes));
    }
}

function updateNoteInDOM(updatedNote) {
    const noteElement = document.querySelector(`.note[data-id='${updatedNote.id}']`);
    if (noteElement) {
        noteElement.querySelector('.note-title').innerText = updatedNote.title;
    }
}

function deleteNoteFromDOM(noteId) {
    const noteElement = document.querySelector(`.note[data-id='${noteId}']`);
    if (noteElement) {
        noteElement.remove();
    }
}

function deleteNoteFromLocalStorage(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const updatedNotes = notes.filter(note => note.id !== noteId);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
}

function viewNoteDetail(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes.find(note => note.id === noteId);
    if (note) {
        document.getElementById('note-detail-title').innerText = note.title;
        document.getElementById('note-detail-content').innerHTML = note.content;
        document.getElementById('note-detail').style.display = 'block';
        document.getElementById('notes-list').style.display = 'none';
        viewNoteId = noteId;
    }
}

function backToList() {
    document.getElementById('note-detail').style.display = 'none';
    document.getElementById('notes-list').style.display = 'block';
}

function editNote() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes.find(note => note.id === viewNoteId);
    if (note) {
        document.getElementById('note-title').value = note.title;
        document.getElementById('editor').innerHTML = note.content;
        document.getElementById('update-note').style.display = 'inline-block';
        document.querySelector('.note-form button[onclick="addNote()"]').style.display = 'none';
        backToList();
        editNoteId = note.id;
    }
}

function deleteCurrentNote() {
    if (viewNoteId) {
        deleteNoteFromDOM(viewNoteId);
        deleteNoteFromLocalStorage(viewNoteId);
        backToList();
    }
}
