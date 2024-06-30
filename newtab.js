document.addEventListener('DOMContentLoaded', () => {
  const readingList = document.getElementById('reading-list');
  const reloadBtn = document.getElementById('reload-btn');
  const exportMdBtn = document.getElementById('export-md-btn');
  const exportHtmlBtn = document.getElementById('export-html-btn');
  const toggleMarkdownBtn = document.getElementById('toggle-markdown-btn');
  const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
  const markdownContainer = document.getElementById('markdown-container');
  const markdownSource = document.getElementById('markdown-source');
  const importBtn = document.getElementById('import-btn');
  const fileInput = document.getElementById('file-input');

  function updateList() {
    chrome.storage.sync.get(['readingList'], (result) => {
      const list = result.readingList || [];
      readingList.innerHTML = ''; // Clear existing list
      list.forEach((item, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const deleteBtn = document.createElement('button');
        
        a.href = item.url;
        a.textContent = item.title;
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteItem(index);

        li.appendChild(a);
        li.appendChild(deleteBtn);
        readingList.appendChild(li);
      });
      updateMarkdown();
    });
  }

  function deleteItem(index) {
    chrome.storage.sync.get(['readingList'], (result) => {
      let list = result.readingList || [];
      list.splice(index, 1);
      chrome.storage.sync.set({ readingList: list }, () => {
        updateList();
      });
    });
  }

  function generateMarkdown() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['readingList'], (result) => {
        const list = result.readingList || [];
        let markdown = "# Reading List\n\n";
        list.forEach((item) => {
          markdown += `- [${item.title}](${item.url})\n`;
        });
        resolve(markdown);
      });
    });
  }

  function exportToMarkdown() {
    generateMarkdown().then((markdown) => {
      const blob = new Blob([markdown], {type: "text/markdown;charset=utf-8"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "reading_list.md";
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  function generateHtml() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['readingList'], (result) => {
        const list = result.readingList || [];
        let html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Reading List</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { color: #333; }
              ul { list-style-type: none; padding: 0; }
              li { margin-bottom: 10px; }
              a { color: #0066cc; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1>Reading List</h1>
            <ul>
        `;
        list.forEach((item) => {
          html += `<li><a href="${item.url}">${item.title}</a></li>`;
        });
        html += `
            </ul>
          </body>
          </html>
        `;
        resolve(html);
      });
    });
  }

  function exportToHtml() {
    generateHtml().then((html) => {
      const blob = new Blob([html], {type: "text/html;charset=utf-8"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "reading_list.html";
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  function updateMarkdown() {
    generateMarkdown().then((markdown) => {
      markdownSource.textContent = markdown;
    });
  }

  function toggleMarkdown() {
    if (markdownContainer.style.display === 'none') {
      markdownContainer.style.display = 'block';
      toggleMarkdownBtn.textContent = 'Hide Markdown';
      updateMarkdown();
    } else {
      markdownContainer.style.display = 'none';
      toggleMarkdownBtn.textContent = 'Show Markdown';
    }
  }

  function copyMarkdown() {
    navigator.clipboard.writeText(markdownSource.textContent).then(() => {
      alert('Markdown copied to clipboard!');
    });
  }

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      if (file.name.endsWith('.md')) {
        importMarkdown(content);
      } else if (file.name.endsWith('.html')) {
        importHtml(content);
      }
    };
    reader.readAsText(file);
  }

  function importMarkdown(content) {
    const lines = content.split('\n');
    const newItems = lines
      .filter(line => line.trim().startsWith('- ['))
      .map(line => {
        const match = line.match(/- \[(.*?)\]\((.*?)\)/);
        if (match) {
          return { title: match[1], url: match[2] };
        }
      })
      .filter(Boolean);

    mergeNewItems(newItems);
  }

  function importHtml(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const links = doc.querySelectorAll('ul li a');
    const newItems = Array.from(links).map(link => ({
      title: link.textContent,
      url: link.href
    }));

    mergeNewItems(newItems);
  }

  function normalizeUrl(url) {
    url = url.replace(/^(https?:)?\/\//, '');
    url = url.replace(/\/$/, '');
    return url.toLowerCase();
  }
  function mergeNewItems(newItems) {
    chrome.storage.sync.get(['readingList'], (result) => {
      let currentList = result.readingList || [];
      const updatedList = [...currentList];
  
      newItems.forEach(newItem => {
        const normalizedNewUrl = normalizeUrl(newItem.url);
        if (!currentList.some(item => normalizeUrl(item.url) === normalizedNewUrl)) {
          updatedList.push(newItem);
        }
      });
      chrome.storage.sync.set({ readingList: updatedList }, () => {
        console.log('List updated with imported items');
        updateList();
      });
    });
  }

  reloadBtn.addEventListener('click', updateList);
  exportMdBtn.addEventListener('click', exportToMarkdown);
  exportHtmlBtn.addEventListener('click', exportToHtml);
  toggleMarkdownBtn.addEventListener('click', toggleMarkdown);
  copyMarkdownBtn.addEventListener('click', copyMarkdown);
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileImport);

  updateList(); // Initial list population
});