const bookmarkNameInput = document.getElementById("bookmark-name");
const bookmarkUrlInput = document.getElementById("bookmark-url");
const addBookmarkBtn = document.getElementById("add-bookmark");
const allInputs = document.querySelectorAll(".input-container");
const bookmarkList = document.getElementById("bookmark-list");

document.addEventListener("DOMContentLoaded", loadBookmarks);

// Watch all inputs for enter keydown submission
allInputs.forEach(input => {
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addBookmarkBtn.click();
        }
    });
});

// Listening for click submission
addBookmarkBtn.addEventListener("click", function () {
    const name = bookmarkNameInput.value.trim();
    const url = bookmarkUrlInput.value.trim();

    if(!name) {
        alert("Please enter a name for the bookmark.");
        return;
    } else if(!url || url=="https://") {
        alert("Please enter a valid URL (ie. https://www.site.com).");
        return;
    }

    // Fetch current data to check for duplicates
    const currentBookmarks = getBookmarksFromStorage();

    // Validate against existing URLS (ignores trailing slashes)
    const isDuplicateURL = currentBookmarks.some(bookmark => {
        const cleanExisting = bookmark.url.replace(/\/$/, "");
        const cleanNew = url.replace(/\/$/, "");
        return cleanExisting.toLowerCase() === cleanNew.toLowerCase();
    });

    if(isDuplicateURL) {
        alert("This URL has already been bookmarked.")
        return; // Stop the function here
    }

    addBookmark(name, url);
    saveBookmak(name, url);

    // Reset Form
    bookmarkNameInput.value = "";
    bookmarkUrlInput.value = "";
});

// Adding bookmark li element to display
function addBookmark(name, url) {
    const div = document.createElement("div");
    div.classList.add("bookmark");

    const link = document.createElement("a");
    link.href = url;
    link.textContent = name;
    link.target = "_blank";

    const removeContainer = document.createElement("div");
    removeContainer.className = "remove-container";

    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.classList.add("btn");
    removeButton.dataset.type = "btn-secondary";

    const removeTooltip = document.createElement("span");
    removeTooltip.className = "remove-tooltip";
    removeTooltip.textContent = "Delete bookmark?";

    removeButton.addEventListener("click", function () {
        bookmarkList.removeChild(div);
        removeBookmarkFromStorage(name, url);
    });

    removeContainer.appendChild(removeButton);
    removeContainer.appendChild(removeTooltip);

    div.appendChild(link);
    div.appendChild(removeContainer);

    bookmarkList.appendChild(div);
}

// Get bookmarks from local storage, if any
function getBookmarksFromStorage() {
    const bookmarks = localStorage.getItem("bookmarks");
    return bookmarks ? JSON.parse(bookmarks) : [];
}

// Save new bookmark to local storage, sort it, and update the UI
function saveBookmak(name, url) {
    const bookmarks = getBookmarksFromStorage();
    bookmarks.push({
        name,
        url,
    });

    // Sort alphabetically by the 'name' property
    bookmarks.sort((a, b) => a.name.localeCompare(b.name));

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    // Refresh the UI display instantly without reloading the browser
    loadBookmarks();
}

// Sort and load all bookmarks from local storage
function loadBookmarks() {
    // Clear the existing list in the DOM to prevent duplicates
    bookmarkList.innerHTML = "";

    const bookmarks = getBookmarksFromStorage();

    // Ensure the array is sorted upon initial page load
    bookmarks.sort((a, b) => a.name.localeCompare(b.name));

    bookmarks.forEach((bookmark) => addBookmark(bookmark.name, bookmark.url));
}

// Deleted selected bookmark from local storage
function removeBookmarkFromStorage(name, url) {
    let bookmarks = getBookmarksFromStorage();
    bookmarks = bookmarks.filter((bookmark) => bookmark.name !== name || bookmark.url !== url);

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}