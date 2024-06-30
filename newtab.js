document.addEventListener('DOMContentLoaded', () => {
  const readingList = document.getElementById('reading-list');
  const reloadBtn = document.getElementById('reload-btn');
  const exportBtn = document.getElementById('export-btn');

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

  function exportToMarkdown() {
    chrome.storage.sync.get(['readingList'], (result) => {
      const list = result.readingList || [];
      let markdown = "# Reading List\n\n";
      list.forEach((item) => {
        markdown += `- [${item.title}](${item.url})\n`;
      });
      
      // Create a Blob with the markdown content
      const blob = new Blob([markdown], {type: "text/markdown;charset=utf-8"});
      
      // Create a link to download the file and trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "reading_list.md";
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);
    });
  }

  reloadBtn.addEventListener('click', updateList);
  exportBtn.addEventListener('click', exportToMarkdown);

  updateList(); // Initial list population
});