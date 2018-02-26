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

function getBookTitleAndAuthorFromAmazon(callback) {
  var bookTitleSelector = "document.querySelector(\"[id$='roductTitle']\").innerHTML";
  var authorSelector = "document.querySelector(\"[class$='contributorNameID']\").innerHTML";
  chrome.tabs.executeScript({
    code: `(function() {
      var bookTitleSelector = ${bookTitleSelector};
      var authorSelector = ${authorSelector};
      return {title: bookTitleSelector, author: authorSelector};
    })();`
  }, (result) => {
    callback(result[0]);
  });
}

// Remove parentheticals and the part of the title after (and including) a colon
function abbreviateTitle(fullTitle) {
  for (var i=0; i<fullTitle.length; i++) {
    if (fullTitle.charAt(i) === ':') {
      return fullTitle.substring(0, i);
    } else if (fullTitle.charAt(i) == '(') {
      return fullTitle.substring(0, i-1); // Remove extra space at the end
    }
  }
}

function pasteQueryIntoTextbox(query) {
  document.getElementById("goodreadsQueryTextbox").value = query;
}

function searchGoodreads(tab) {
  var goodreadsURL = "https://www.goodreads.com/search?q=";
  // https://www.goodreads.com/search?q=The+Second+Chance+Cafe+alison+kent
  var queryTextbox = document.getElementById("goodreadsQueryTextbox");
  var query = queryTextbox.value;
  console.log(query);
  if (query !== "") {
    console.log(query);
    goodreadsURL += encodeURIComponent(query).replace(/%20/g, '+');
    if (tab === "current") {
      chrome.tabs.update({url: goodreadsURL});
    } else if (tab === "new") {
      chrome.tabs.create({url: goodreadsURL});
    }
  } else {
    console.log("query is empty");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(document.getElementById("goodreadsQueryTextbox").value);
  var currentTabButton = document.getElementById("currentTabButton");
  currentTabButton.addEventListener('click', function() {
    searchGoodreads("current");
  });

  var newTabButton = document.getElementById("newTabButton");
  newTabButton.addEventListener('click', function() {
    searchGoodreads("new");
  });

  currentTabOnAmazon((onAmazon) => {
    if (onAmazon) {
      getBookTitleAndAuthorFromAmazon((titleAndAuthor) => {
        if (titleAndAuthor !== null) {
          var query = `${abbreviateTitle(titleAndAuthor.title)} ${titleAndAuthor.author}`;
          console.log(query);
          pasteQueryIntoTextbox(query);
        } else {
          console.log("title and author are null");
        }
      });
    }
  });
});
