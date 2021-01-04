
"use strict";

var date;


function pad(num, size) {

    if (size - num.length > 8) {

        size = num.length + 1
    }
    var s = "00000000" + num;
    return s.substr(s.length - size);
}


function formattedDate(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return year + "-" + pad(month, 2) + "-" + pad(day, 2);
}


function log(msg) {
    document.getElementById("message").innerHTML += "<br>" + msg;
}


function bookmarkTabs(windows, sessionFolder, windowFolder) {

    var win = windows[0];

    chrome.tabs.query({ windowId: win.id }, function (arrayOfTabs) {

        // Create bookmarks for tabs in window
        for (var i = 0; i < arrayOfTabs.length; i++) {
            chrome.bookmarks.create(
                {
                    "parentId": windowFolder.id,
                    "url": arrayOfTabs[i].url,
                    "title": arrayOfTabs[i].title
                }
            );
        }

        log("Bookmarked " + arrayOfTabs.length + " tabs for " + windowFolder.title);

        if (windows.length == 1) {

            return
        } else {

            windows.shift()
            createWindowFolders(windows, sessionFolder);
        }

    });

}


function createWindowFolders(windows, sessionFolder) {

    var win = windows[0];
    var windowTitle = "Window " + String(win.id);

    chrome.bookmarks.create(
        { "parentId": sessionFolder.id, "title": windowTitle },
        function (windowFolder) {
            bookmarkTabs(windows, sessionFolder, windowFolder);
        }
    );

}


function getAllWindows(yearFolder) {
    chrome.windows.getAll(function (windows) {
        createWindowFolders(windows, yearFolder);
    });
}


function createSessionFolder(yearFolder) {

    var folderTitle = formattedDate(date);

    // Get the current session folder
    chrome.bookmarks.search({ title: folderTitle, "url": undefined }, function (results) {

        if (results.length == 0) {

            // Create current session folder
            log("Current session folder doesn't exist. Creating...")

            chrome.bookmarks.create(
                { "parentId": yearFolder.id, "title": folderTitle },
                getAllWindows
            );

        } else {

            getAllWindows(results[0]);
        }
    })


}


function start() {

    date = new Date();
    var sessionsFolderName = "Session Snapshots";

    // Get the past sessions folder
    chrome.bookmarks.search({ title: sessionsFolderName, "url": undefined }, function (results) {

        if (results.length == 0) {
            // Create past sessions folder
            log("Sessions bookmark folder doesn't exist. Creating...")

            chrome.bookmarks.create(
                { "title": sessionsFolderName },
                createSessionFolder
            );

        } else {
            createSessionFolder(results[0]);
        }

    })

}


let saveSession = document.getElementById("saveSession");

saveSession.addEventListener("click", start);

