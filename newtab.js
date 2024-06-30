document.addEventListener('DOMContentLoaded', () => {
  const readingList = document.getElementById('reading-list');

  chrome.storage.sync.get(['readingList'], (result) => {
    const list = result.readingList || [];
    list.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.appendChild(a);
      readingList.appendChild(li);
    });
  });
});