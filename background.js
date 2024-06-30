chrome.browserAction.onClicked.addListener((tab) => {
  chrome.storage.sync.get(['readingList'], (result) => {
    let readingList = result.readingList || [];
    readingList.push({ title: tab.title, url: tab.url });
    chrome.storage.sync.set({ readingList: readingList }, () => {
      console.log('頁面已加入待讀清單');
    });
  });
});