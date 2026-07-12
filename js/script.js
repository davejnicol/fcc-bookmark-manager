const bookmarkNameInput = document.getElementById("bookmark-name");
const bookmarkUrlInput = document.getElementById("bookmark-url");
const bookmarkTagsInput = document.getElementById("bookmark-tags");
const tagsDatalist = document.getElementById("tags-suggestions");
const addBookmarkBtn = document.getElementById("add-bookmark");
const allInputs = document.querySelectorAll(".input-container");
const bookmarkList = document.getElementById("bookmark-list");

// Search and Sort DOM Elements
const searchBar = document.getElementById("search-bar");
const toggleSortBtn = document.getElementById("toggle-sort");

// Track current sort state ('alphabetical' or 'chronological')
let currentSortState = "alphabetical";

document.addEventListener("DOMContentLoaded", () => {
    loadBookmarks();
    updateAutocompleteSuggestions(); // Populate suggestions on page load
});

// Watch all inputs for enter keydown submission
allInputs.forEach(input => {
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addBookmarkBtn.click();
        }
    });
});

// Array to track current tags typed into the input view
let activeTags = [];
const tagWrapper = document.getElementById("tag-wrapper");

// Focus the actual input when clicking anywhere on the wrapper container
tagWrapper.addEventListener("click", () => {
    bookmarkTagsInput.focus();
});

// Real-time search listener
searchBar.addEventListener("input", loadBookmarks);

// Sort toggle listener
toggleSortBtn.addEventListener("click", function() {
    if (currentSortState === "alphabetical") {
        currentSortState = "chronological";
        toggleSortBtn.textContent = "Sort: Chronological";
    } else {
        currentSortState = "alphabetical";
        toggleSortBtn.textContent = "Sort: Alphabetical";
    }
    loadBookmarks();
});

// Click submission logic
addBookmarkBtn.addEventListener("click", function () {
    const name = bookmarkNameInput.value.trim();
    const url = bookmarkUrlInput.value.trim();
    // const rawTags = bookmarkTagsInput.value.trim();

    if(!name) {
        alert("Please enter a name for the bookmark.");
        return;
    } else if(!url || url=="https://") {
        alert("Please enter a valid URL (ie. https://www.site.com).");
        return;
    }

    // Process comma-separated tags into a clean, lowercase array of strings
    // const tags = rawTags 
    //     ? rawTags.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
    //     : [];
    const tags = [...activeTags];

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

    // addBookmark(name, url, tags);
    saveBookmak(name, url, tags);

    // Reset Form
    bookmarkNameInput.value = "";
    bookmarkUrlInput.value = "";
    bookmarkTagsInput.value = "";
    activeTags = []; // Reset our tracking array
    renderInputPills(); // Refresh the DOM view to empty out the pills

    // Hide the popover element natively
    const modal = document.getElementById("bookmark-modal");
    modal.hidePopover();
});

// Dynamic UI generation with clickable Tag Badges
function addBookmark(name, url, tags = []) {
    const div = document.createElement("div");
    div.classList.add("bookmark");

    // Content container wrapper for structural styling layout
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("bookmark-content");

    const link = document.createElement("a");
    link.href = url;
    link.textContent = name;
    link.target = "_blank";
    contentDiv.appendChild(link);

    const urlText = document.createElement("div");
    urlText.classList.add("bookmark-url");
    urlText.textContent = url;
    contentDiv.appendChild(urlText);

    // Build the visual container wrapper for tags
    if (tags.length > 0) {
        const tagsContainer = document.createElement("div");
        tagsContainer.classList.add("tags-container");
        
        tags.forEach(tag => {
            const tagSpan = document.createElement("span");
            tagSpan.classList.add("tag-pill");
            tagSpan.textContent = tag;
            tagSpan.style.cursor = "pointer"; // Indicates interactivity

            // Clicking pill sets search text query and filters the view
            tagSpan.addEventListener("click", function() {
                searchBar.value = tag;
                loadBookmarks();
            });

            tagsContainer.appendChild(tagSpan);
        });
        contentDiv.appendChild(tagsContainer);
    }

    const removeContainer = document.createElement("div");
    removeContainer.className = "remove-container";

    const removeButton = document.createElement("button");
    removeButton.innerHTML = "&times;";
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

    div.appendChild(contentDiv);
    div.appendChild(removeContainer);

    bookmarkList.appendChild(div);
}

// Get bookmarks from local storage, if any
function getBookmarksFromStorage() {
    const bookmarks = localStorage.getItem("bookmarks");
    return bookmarks ? JSON.parse(bookmarks) : [];
}

// Save new bookmark to local storage, sort it, and update the UI
function saveBookmak(name, url, tags) {
    const bookmarks = getBookmarksFromStorage();

    // Chronological tracking relies on array push order (latest is last)
    bookmarks.push({
        name, 
        url,
        tags,
    });

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    // Refresh the UI display instantly without reloading the browser
    loadBookmarks();
    updateAutocompleteSuggestions(); // Recalculate options for the next form entry
}

// Master function handling search filtering, sorting, and UI rendering from local storage
function loadBookmarks() {
    // Clear the existing list in the DOM to prevent duplicates
    bookmarkList.innerHTML = "";

    let bookmarks = getBookmarksFromStorage();

    // 1. Apply real-time search filter (matches name OR URL)
    const query = searchBar.value.toLowerCase().trim();
    if (query) {
        bookmarks = bookmarks.filter(bookmark => {
            const matchesName = bookmark.name.toLowerCase().includes(query); 
            const matchesUrl = bookmark.url.toLowerCase().includes(query);

            // Checks if any array items contain the query text string
            const matchesTags = bookmark.tags && bookmark.tags.some(tag => tag.includes(query));
            
            return matchesName || matchesUrl || matchesTags;
        });
    }

    // 2. Apply sorting condition
    if (currentSortState === "alphabetical") {
        bookmarks.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortState === "chronological") {
        // Reverse array order so newest bookmarks appear at the top
        bookmarks.reverse();
    }

    // 3. Render items
    bookmarks.forEach((bookmark) => addBookmark(bookmark.name, bookmark.url, bookmark.tags));
}

// Deleted selected bookmark from local storage
function removeBookmarkFromStorage(name, url) {
    let bookmarks = getBookmarksFromStorage();
    bookmarks = bookmarks.filter((bookmark) => bookmark.name !== name || bookmark.url !== url);

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    // Reload dynamically to update list lengths or filtered visibility states safely
    loadBookmarks();
    updateAutocompleteSuggestions(); // Recalculate options since some tags might no longer exist
}

// Gathers unique tags and builds option markup inside datalist
function updateAutocompleteSuggestions() {
    const bookmarks = getBookmarksFromStorage();
    const uniqueTags = new Set();

    // Loop data properties and insert arrays into Set structure to drop duplicates
    bookmarks.forEach(bookmark => {
        if (bookmark.tags) {
            bookmark.tags.forEach(tag => uniqueTags.add(tag));
        }
    });

    // Reset old options list layout markup 
    tagsDatalist.innerHTML = "";

    // Parse what the user has typed so far
    const currentTypedValue = bookmarkTagsInput.value.trim().toLowerCase();

    // Generate option elements for autocomplete menu UI drop downs
    uniqueTags.forEach(tag => {
        // Only suggest if the tag hasn't already been added as a pill
        if (!activeTags.includes(tag) && tag.includes(currentTypedValue)) {
            const option = document.createElement("option");
            option.value = tag;

            tagsDatalist.appendChild(option);
        }
    });
}

// Function to render the UI pills inside the input wrapper
function renderInputPills() {
    // Remove old pills (keep the input element)
    const existingPills = tagWrapper.querySelectorAll(".input-tag-pill");
    existingPills.forEach(pill => pill.remove());

    // Generate new pills in order
    activeTags.forEach((tag, index) => {
        const pill = document.createElement("span");
        pill.classList.add("input-tag-pill");
        pill.textContent = tag;

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "&times;";
        removeBtn.classList.add("remove-tag-btn");
        removeBtn.type = "button";
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Stop from triggering the input focus
            activeTags.splice(index, 1);
            renderInputPills();
            updateAutocompleteSuggestions();
        });

        pill.appendChild(removeBtn);
        tagWrapper.insertBefore(pill, bookmarkTagsInput);
    });

    // Toggle placeholder text based on whether tags exist
    if (activeTags.length > 0) {
        bookmarkTagsInput.removeAttribute("placeholder");
    } else {
        bookmarkTagsInput.setAttribute("placeholder", "Tags (e.g. tech, shopping, dev)");
    }
}

// Handle adding tags via Comma, Enter, or selecting a Datalist option
bookmarkTagsInput.addEventListener("input", function(e) {
    const value = e.target.value;

    // 1. Get a clean array of all available master tags currently in the datalist
    const availableOptions = Array.from(tagsDatalist.options).map(opt => opt.value.toLowerCase());

    // 2. Check if the user typed a comma OR selected an option exactly matching an available tag
    if (value.includes(",")) {
        const parts = value.split(",");
        const tagToAdd = parts[0].trim().toLowerCase();
        
        if (tagToAdd && !activeTags.includes(tagToAdd)) {
            activeTags.push(tagToAdd);
            renderInputPills();
        }
        bookmarkTagsInput.value = ""; // Clear input for the next tag
        updateAutocompleteSuggestions();
    }
    // This catches mouse clicks and Tab/Enter autocompletes natively!
    else if (availableOptions.includes(value.trim().toLowerCase())) {
        const tagToAdd = value.trim().toLowerCase();
        if (!activeTags.includes(tagToAdd)) {
            activeTags.push(tagToAdd);
            renderInputPills();
        }
        bookmarkTagsInput.value = ""; // Reset the field so they can type the next tag
        updateAutocompleteSuggestions();
    } else {
        // Still filter regular typing live
        updateAutocompleteSuggestions();
    }
});

// Capture Backspace (to delete last tag) and Enter keys for custom typed text
bookmarkTagsInput.addEventListener("keydown", function(e) {
    if (e.key === "Backspace" && bookmarkTagsInput.value === "" && activeTags.length > 0) {
        activeTags.pop();
        renderInputPills();
        updateAutocompleteSuggestions();
    }
    if (e.key === "Enter" && bookmarkTagsInput.value.trim() !== "") {
        e.preventDefault();
        e.stopPropagation(); // Stop it from triggering the master add-bookmark submission

        const tagToAdd = bookmarkTagsInput.value.trim().toLowerCase();
        if (!activeTags.includes(tagToAdd)) {
            activeTags.push(tagToAdd);
            renderInputPills();
        }
        bookmarkTagsInput.value = "";
        updateAutocompleteSuggestions();
    }
});