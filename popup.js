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
  // console.log(${bookTitleSelector});
  // console.log(${authorSelector});
  //
  // var authorSelector = "document.querySelector(\"[class$='contributorNameID']\").innerHTML";
  // console.log(${bookTitleSelector});
  // console.log(${authorSelector});

  // var script = `var bookTitleSelector = ${bookTitleSelector}; var authorSelector = ${authorSelector}; return {bookTitleSelector: bookTitleSelector, authorSelector: authorSelector};`;
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
    if (fullTitle.charAt(i) === ':' || fullTitle.charAt(i) == '(') {
      return fullTitle.substring(0, i-1); // Remove extra space at the end
    }
  }
}

// This extension performs a search on Goodreads in two ways:
// 1. Gathering the title and author of a book from the open Amazon page
// 2. Allowing the user to enter a query of their own
document.addEventListener('DOMContentLoaded', () => {
  currentTabOnAmazon((onAmazon) => {
    if (onAmazon) {
      getBookTitleAndAuthorFromAmazon((titleAndAuthor) => {
        var query = `${abbreviateTitle(titleAndAuthor.title)} ${titleAndAuthor.author}`;
        console.log(query);
      });
    } else {
      alert("This tab is NOT on Amazon!");
    }
  });
});
