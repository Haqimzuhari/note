document.addEventListener("DOMContentLoaded", loadMarkdowns);

let currentMarkdownId = null;

function formatText(command) {
    document.execCommand(command, false, null);
    var ul_list = document.querySelectorAll('ul');
    var ul_array = [...ul_list];
    ul_array.forEach(ul => {
        ul.classList.add('list-disc', 'list-inside')
    });
    var ol_list = document.querySelectorAll('ol');
    var ol_array = [...ol_list];
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
                table += "<td class='border border-zinc-300 p-2'></td>";
            }
            table += "</tr>";
        }
        table += "</table>";
        document.execCommand('insertHTML', false, table);
    }
}

function formatQuote() {
    const quote = prompt("Enter quote text:");
    if (quote) {
        const quoteHTML = `<div class="flex"><blockquote class="bg-sky-100 rounded px-4 py-2 my-2 border-l-8 border-sky-500 font-quote italic">&ldquo;${quote}&rdquo;</blockquote></div>`;
        document.execCommand('insertHTML', false, quoteHTML);
    }
}

function formatCode() {
    const code = prompt("Enter code:");
    if (code) {
        // const codeHTML = `<pre class="my-2"><code class="bg-slate-100 rounded px-4 py-2">${code}</code></pre>`;
        const codeHTML = `<div class="mb-1 bg-slate-800 text-white rounded px-4 py-2 font-mono">${code}</div>`;
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
    loadMarkdowns();
}

function loadMarkdowns() {
    const titles = JSON.parse(localStorage.getItem('titles')) || [];
    const markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    const markdownList = document.getElementById('markdowns');
    markdownList.innerHTML = '';
    
    if (markdowns.length > 0) {
        markdowns.forEach((markdown, index) => {
            const li = document.createElement('li');
            li.textContent = titles[index];
            li.onclick = () => viewMarkdown(index);
            markdownList.appendChild(li);
        });
    }
}

function viewMarkdown(index) {
    const markdowns = JSON.parse(localStorage.getItem('markdowns')) || [];
    
    if (markdowns.length > 0) {
        currentMarkdownId = index;
        document.getElementById('markdown-content').innerHTML = markdowns[index];
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
