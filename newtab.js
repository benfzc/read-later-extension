document.addEventListener('DOMContentLoaded', () => {
  const readingList = document.getElementById('reading-list');
  const reloadBtn = document.getElementById('reload-btn');
  const exportBtn = document.getElementById('export-btn');
  const toggleMarkdownBtn = document.getElementById('toggle-markdown-btn');
  const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
  const markdownContainer = document.getElementById('markdown-container');
  const markdownSource = document.getElementById('markdown-source');

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
      updateMarkdown(); // Update Markdown when list is updated
    });
  }

  function deleteItem(index) {
    chrome.storage.sync.get(['readingList'], (result) => {
      let list = result.readingList || [];
      list.splice(index, 1);
      chrome.storage.sync.set({ readingList: list }, () => {
        updateList(); // Refresh the list after deleting
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

  reloadBtn.addEventListener('click', updateList);
  exportBtn.addEventListener('click', exportToMarkdown);
  toggleMarkdownBtn.addEventListener('click', toggleMarkdown);
  copyMarkdownBtn.addEventListener('click', copyMarkdown);

  updateList(); // Initial list population
});