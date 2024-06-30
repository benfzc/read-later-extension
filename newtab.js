document.addEventListener('DOMContentLoaded', () => {
  const readingList = document.getElementById('reading-list');
  const reloadBtn = document.getElementById('reload-btn');

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

  reloadBtn.addEventListener('click', updateList);

  updateList(); // Initial list population
});