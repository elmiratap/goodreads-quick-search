function getCurrentTabURL(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });
}

function currentTabOnAmazon(callback) {
  var amazonURL = "www.amazon.com";
  getCurrentTabURL((url) => {
    callback(url.includes(amazonURL));
  });
}

// This extension
document.addEventListener('DOMContentLoaded', () => {
  currentTabOnAmazon((onAmazon) => {
    if (onAmazon) {
      alert("This tab is on Amazon!");
    } else {
      alert("This tab is NOT on Amazon!");
    }
  });
});
