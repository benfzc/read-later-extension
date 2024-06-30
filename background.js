chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(['readingList'], (result) => {
    let readingList = result.readingList || [];
    readingList.push({ 
      title: tab.title,
      url: tab.url 
    });
    chrome.storage.sync.set({ readingList: readingList }, () => {
      console.log('Page added to reading list');
    });
  });
});