let dispatchDatabase = [];
let displayedDispatches = [];

// Load dispatched items from localStorage on page load
document.addEventListener("DOMContentLoaded", function () {
    const storedDispatches = JSON.parse(localStorage.getItem("displayedDispatches")) || [];
    displayedDispatches = storedDispatches;
    updateDispatchColumns();
});

function searchDispatch() {
    const dispatchNumber = document.getElementById("dispatchNumber").value;
    const fileInput = document.getElementById("hiddenFileInput");

    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a CSV file.');
        return;
    }

    const file = fileInput.files[0];

    Papa.parse(file, {
        complete: function (result) {
            dispatchDatabase = result.data;

            const foundDispatch = dispatchDatabase.find(dispatch => dispatch.Dispatch === dispatchNumber);

            if (foundDispatch) {
                // Update the displayed dispatches before displaying details
                updateDisplayedDispatches(foundDispatch);

                // Display the category dropdown and update button
                document.getElementById("statusSelection").style.display = "block";

                // Populate the category dropdown with the current category
                const categoryDropdown = document.getElementById("statusDropdown");
                categoryDropdown.value = foundDispatch.Category;
            } else {
                alert('Dispatch not found');
            }
        },
        header: true
    });
}

function moveToCategory(dispatchNumber) {
    const categoryDropdown = document.getElementById("statusDropdown");
    const selectedCategory = categoryDropdown.value;

    if (selectedCategory) {
        const dispatchToUpdate = displayedDispatches.find(dispatch => dispatch.Dispatch === dispatchNumber);

        if (dispatchToUpdate) {
            dispatchToUpdate.Category = selectedCategory;
            updateDispatchColumns(); // Update the board after moving to a different category
        }
    }

    closeModal(); // Close the modal regardless of the category input
}



function updateDisplayedDispatches(dispatchToUpdate) {
    // Check if the dispatch is already in displayedDispatches
    const index = displayedDispatches.findIndex(dispatch => dispatch.Dispatch === dispatchToUpdate.Dispatch);

    if (index !== -1) {
        // If the dispatch is found, update its category
        displayedDispatches[index].Category = dispatchToUpdate.Category;
    } else {
        // If the dispatch is not found, add it to displayedDispatches
        displayedDispatches.push(dispatchToUpdate);
    }

    // Update the dispatch columns on the webpage
    updateDispatchColumns();

    // Save the displayedDispatches to localStorage
    localStorage.setItem("displayedDispatches", JSON.stringify(displayedDispatches));
}


function updateDispatchColumns() {
    const dispatchColumnsContainer = document.getElementById("dispatchColumns");
    dispatchColumnsContainer.innerHTML = "";

    allCategories.forEach(category => {
        // Create a container for each category
        const categoryContainer = document.createElement("div");
        categoryContainer.className = "category-container";

        // Create and append category title
        const categoryTitle = document.createElement("h2");
        categoryTitle.textContent = category;
        categoryContainer.appendChild(categoryTitle);

        // Create a row for dispatches
        const dispatchesRow = document.createElement("div");
        dispatchesRow.className = "dispatches-row";

        const filteredDispatches = displayedDispatches.filter(dispatch => dispatch.Category === category);

        if (filteredDispatches.length > 0) {
            filteredDispatches.forEach(dispatch => {
                const dispatchBlock = createDispatchBlock(dispatch);
                dispatchBlock.addEventListener("click", () => displayDispatchDetails(dispatch.Dispatch));
                dispatchesRow.appendChild(dispatchBlock);
            });
        } else {
            const noDispatchesText = document.createElement("p");
            noDispatchesText.textContent = "No dispatches in this category";
            dispatchesRow.appendChild(noDispatchesText);
        }

        categoryContainer.appendChild(dispatchesRow);
        dispatchColumnsContainer.appendChild(categoryContainer);
    });
}



// Helper function to create a dispatch block
function createDispatchBlock(dispatch) {
    const dispatchBlock = document.createElement("div");
    dispatchBlock.className = "dispatch-block";
    dispatchBlock.innerHTML = `
        <h3>${dispatch.Dispatch}</h3>
        <p>${dispatch['Location Name']}</p>
        <p>${dispatch.City}</p> <!-- Updated line -->
        <p>Status: ${dispatch.Status}</p>`;
    return dispatchBlock;
}

function displayDispatchDetails(dispatchNumber) {
    // Find the dispatch either in displayedDispatches or dispatchDatabase
    let dispatch = displayedDispatches.find(d => d.Dispatch === dispatchNumber);
    if (!dispatch) {
        dispatch = dispatchDatabase.find(d => d.Dispatch === dispatchNumber);
    }
    if (dispatch) {
        const modalContainer = document.createElement("div");
        modalContainer.className = "modal";

        // Gather existing and new notes
        const existingNotes = dispatch.Notes || 'No existing notes';
        const newNotes = dispatch.NewNotes ? dispatch.NewNotes.join('\n') : 'No new notes';

        // Populate modal content
        modalContainer.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <h2>Dispatch Details</h2>
                <h3>${dispatch.Dispatch}</h3>
                <p>${dispatch['Location Name']}</p>
                <p>City: ${dispatch.City}</p>
                <p>Status: ${dispatch.Status}</p>
                <div class="notes-section">
                    <h3>Existing Notes</h3>
                    <textarea readonly class="existing-notes">${existingNotes}</textarea>
                    <h3>New Notes</h3>
                    <textarea readonly class="new-notes">${newNotes}</textarea>
                    <textarea id="newNote" placeholder="Enter new note here..."></textarea>
                    <button onclick="addNewNote('${dispatch.Dispatch}')">Add Note</button>
                </div>

            </div>`;

        document.body.appendChild(modalContainer);
        modalContainer.style.display = "block";
    }
}



// Helper function to format notes into paragraphs
function formatNotes(notes) {
    const paragraphs = notes.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('');
    return paragraphs;
}

function updateDispatch() {
    const dispatchNumber = document.getElementById("dispatchNumber").value;
    const categoryDropdown = document.getElementById("statusDropdown");
    const selectedCategory = categoryDropdown.value;

    // Find the dispatch to update in the displayedDispatches array
    const dispatchToUpdateIndex = displayedDispatches.findIndex(dispatch => dispatch.Dispatch === dispatchNumber);

    if (dispatchToUpdateIndex !== -1) {
        // Update the category of the dispatch
        displayedDispatches[dispatchToUpdateIndex].Category = selectedCategory;

        // Update the dispatch columns on the webpage
        updateDispatchColumns();

        // Save the displayedDispatches to localStorage
        localStorage.setItem("displayedDispatches", JSON.stringify(displayedDispatches));

        // Close the modal or hide the category dropdown and button
        document.getElementById("statusSelection").style.display = "none";
    } else {
        alert('Dispatch not found in the displayed dispatches.');
    }
}



function closeModal() {
    // Find and remove the modal container
    const modalContainer = document.querySelector(".modal");
    if (modalContainer) {
        modalContainer.remove();
    }
}


function clearDispatch(dispatchNumber) {
    // Implement logic to clear the dispatch (remove it from the board)
    // For example:
    const index = displayedDispatches.findIndex(dispatch => dispatch.Dispatch === dispatchNumber);
    if (index !== -1) {
        displayedDispatches.splice(index, 1);
        updateDispatchColumns(); // Update the board after clearing the dispatch
    }

    closeModal(); // Close the modal after clearing
}

function removeDispatch(dispatchNumber) {
    const index = displayedDispatches.findIndex(dispatch => dispatch.Dispatch === dispatchNumber);
    if (index !== -1) {
        displayedDispatches.splice(index, 1);
        updateDispatchColumns(); // Update the board after removing the dispatch
    }

    closeModal(); // Close the modal after removing
}

function removeDispatchFromPage(dispatchNumber) {
    const index = displayedDispatches.findIndex(dispatch => dispatch.Dispatch === dispatchNumber);
    
    if (index !== -1) {
        // Remove the dispatch from displayedDispatches
        displayedDispatches.splice(index, 1);

        // Update the dispatch columns on the webpage
        updateDispatchColumns();

        // Save the displayedDispatches to localStorage
        localStorage.setItem("displayedDispatches", JSON.stringify(displayedDispatches));

        // Close the modal
        closeModal();
    } else {
        alert('Dispatch not found in the displayed dispatches.');
    }
}

function setDefaultFile() {
    document.getElementById('hiddenFileInput').click();
}

function saveNotes(dispatchNumber) {
    const existingNotes = document.getElementById("existingNotes").value;
    const newNotes = document.getElementById("dispatchNotes").value;
    const dispatchIndex = displayedDispatches.findIndex(d => d.Dispatch === dispatchNumber);

    if (dispatchIndex !== -1) {
        // Check if there are existing notes, then format accordingly
        displayedDispatches[dispatchIndex].Notes = existingNotes +
            (existingNotes ? "\n\n<-------->\n" : "") + newNotes;

        // Update localStorage
        localStorage.setItem("displayedDispatches", JSON.stringify(displayedDispatches));
    }

    closeModal(); // Close the modal after saving notes
}

// To Do List
let todos = [];

function addTodo() {
    const newTodoText = document.getElementById('newTodo').value;
    if (newTodoText) {
        todos.push(newTodoText);
        document.getElementById('newTodo').value = '';
        updateTodoList();
        saveTodosToLocalStorage(); // Save updated list to localStorage
    }
}

function updateTodoList() {
    const todoListElement = document.getElementById('todoList');
    todoListElement.innerHTML = ''; // Clear existing list
    
    // Create an ordered list manually
    const orderedList = document.createElement('ol');
    
    todos.forEach((todo, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = todo;
        listItem.appendChild(createRemoveButton(index));
        orderedList.appendChild(listItem);
    });

    todoListElement.appendChild(orderedList);
}

function createRemoveButton(index) {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.classList.add('stylish-button'); // Add a class for styling
    removeButton.onclick = function() {
        removeTodo(index);
    };
    return removeButton;
}

function removeTodo(index) {
    todos.splice(index, 1);
    updateTodoList();
    saveTodosToLocalStorage(); // Save updated list to localStorage
}

function saveTodosToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

document.addEventListener("DOMContentLoaded", function () {
    // Load existing dispatched items
    const storedDispatches = JSON.parse(localStorage.getItem("displayedDispatches")) || [];
    displayedDispatches = storedDispatches;
    updateDispatchColumns();

    // Load existing to-do items
    todos = JSON.parse(localStorage.getItem('todos')) || [];
    updateTodoList();
});


// New Note Function
function addNewNote(dispatchNumber) {
    const newNote = document.getElementById("newNote").value;
    const dispatchIndex = displayedDispatches.findIndex(d => d.Dispatch === dispatchNumber);

    if (dispatchIndex !== -1 && newNote) {
        // Add the new note as a separate entry
        if (displayedDispatches[dispatchIndex].NewNotes) {
            displayedDispatches[dispatchIndex].NewNotes.push(newNote);
        } else {
            displayedDispatches[dispatchIndex].NewNotes = [newNote];
        }

        // Update localStorage
        localStorage.setItem("displayedDispatches", JSON.stringify(displayedDispatches));

        // Optionally clear the new note text area
        document.getElementById("newNote").value = '';
    }

    // Optionally close the modal or refresh the notes display
}

function showOtherDispatches(locationName) {
    const matchingDispatches = dispatchDatabase.filter(dispatch => dispatch['Location Name'] === locationName);

    // Open a new window and display the matching dispatches
    const newWindow = window.open("", "_blank");
    const htmlContent = matchingDispatches.map(dispatch => 
        `<p>Dispatch Number: ${dispatch.Dispatch}, Location Name: ${dispatch['Location Name']}</p>`
    ).join('');
    
    newWindow.document.write(htmlContent);
}


function searchByLocation() {
    const searchNumber = document.getElementById('locationSearch').value;
    const uniqueDispatchNumbers = new Set();
    const resultsContainer = document.getElementById('resultList');

    resultsContainer.innerHTML = ''; // Clear previous results

    dispatchDatabase.forEach(dispatch => {
        if (dispatch['Location Name'].includes(searchNumber) && !uniqueDispatchNumbers.has(dispatch.Dispatch)) {
            uniqueDispatchNumbers.add(dispatch.Dispatch);

            // Create and append a dispatch block for each unique result
            const dispatchBlock = createSearchResultBlock(dispatch);
            resultsContainer.appendChild(dispatchBlock);
        }
    });
}

// Helper function to create a search result block
function createSearchResultBlock(dispatch) {
    const dispatchBlock = document.createElement("div");
    dispatchBlock.className = "dispatch-block";
    dispatchBlock.innerHTML = `
        <h3>${dispatch.Dispatch}</h3>
        <p>${dispatch['Location Name']}</p>
        <p>${dispatch.City}</p>
        <p>Status: ${dispatch.Status}</p>`;

     // Attach click event listener
     dispatchBlock.addEventListener("click", () => displayDispatchDetails(dispatch.Dispatch));
     return dispatchBlock;
}




function loadCsvData() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file.');
        return;
    }

    Papa.parse(file, {
        complete: function (result) {
            dispatchDatabase = result.data;
            alert('CSV data loaded successfully!');
        },
        header: true
    });
}

const allCategories = ["Installs", "Follow Up", "Very Important", "Needs Equipment"];
