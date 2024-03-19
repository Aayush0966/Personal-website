document.addEventListener("DOMContentLoaded", function() {
    // Initialize Flatpickr for event date
    flatpickr("#event-date", {
        dateFormat: "Y-m-d",
        minDate: "today"
    });

    // Initialize Flatpickr for inline calendar inside the "Calendar" div
});


/*window.addEventListener('load', async () => {
    try {
        // Retrieve the JWT token from local storage
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Show the modal popup
            $('#myModal').modal('show');
            document.getElementById('popupMessage').innerText = 'Session has expired. Please login again.';
            return;
        }

        // Make a request to the serverless function endpoint
        const response = await fetch('/.netlify/functions/authenticate', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (!data.authenticated) {
            // Show the modal popup
            $('#myModal').modal('show');
            const username = data.username ? `Hello, ${data.username}!\n` : '';
            document.getElementById('popupMessage').innerText = `${username}Session has expired. Please login again.`;

            // Clear JWT token from local storage
            localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to redirect to login page
function redirectToLogin() {
    window.location.href = '/login';
}
*/

$(document).ready(function() {
    // Get authentication token from cookie
    const authToken = localStorage.getItem('authToken');


    // Fetch event dates from the API with authentication token
    fetch("/.netlify/functions/calendar", {
        headers: {
            'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch event dates');
        }
        return response.json();
    })
    .then(eventData => {
        // Extract event dates from the API response
        const eventDates = eventData.map(event => event.date);

        // Initialize Bootstrap Datepicker for Calendar
        $('#jquery-calendar').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            multidate: true,
            multidateSeparator: ',',
            beforeShowDay: function(date) {
                // Convert date to yyyy-mm-dd format
                const dateString = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                
                // Check if the current date is today's date
                const isToday = dateString === getCurrentDate();
                
                // Check if the current date is in the eventDates array
                if (eventDates.includes(dateString)) {
                    // Return an array with 'event-date' class to mark the event date
                    return {
                        classes: 'red'
                    };
                } else {
                    // Return an empty array for dates that are not events
                    return [];
                }
            }
        });

        // Select today's date by default
        $('#jquery-calendar').datepicker('setDate', new Date());
    })
    .catch(error => {
        console.error('Error fetching event dates:', error);
        // Handle error
    });
});

// Function to get today's date in yyyy-mm-dd format
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}



document.addEventListener("DOMContentLoaded", function() {
    // Display dashboard section by default
    showSection('dashboard');

    // Add event listeners to section links
    const sectionLinks = document.querySelectorAll('.section');
    sectionLinks.forEach(link => {
        link.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const socialLinks = document.querySelectorAll('.social-link');
    const contextMenu = document.getElementById('context-menu');
    const editMenuItem = document.getElementById('editMenuItem');
    const editLinkInputContainer = document.getElementById('editLinkInputContainer');
    const editLinkInput = document.getElementById('editLinkInput');
    const submitEditButton = document.getElementById('submitEditButton');

    let currentSocialMedia = null;

    // Function to show edit link input box
    function showEditLinkInputBox(x, y) {
        editLinkInputContainer.style.display = 'block';
        editLinkInput.value = ''; // Clear input field
        editLinkInput.focus(); // Focus on input field
        editLinkInputContainer.style.left = `${x}px`;
        editLinkInputContainer.style.top = `${y}px`;
    }

    // Function to hide edit link input box
    function hideEditLinkInputBox() {
        editLinkInputContainer.style.display = 'none';
    }

    socialLinks.forEach(link => {
        link.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const x = e.clientX;
            const y = e.clientY;
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            currentSocialMedia = link.dataset.socialMedia;
        });

        // Event listener for Edit menu item
        editMenuItem.addEventListener('click', (e) => {
            contextMenu.style.display = 'none';
            hideEditLinkInputBox(); // Hide any open input boxes
            showEditLinkInputBox(e.clientX, e.clientY);
        });
    });


    // Event listener for Submit button
    submitEditButton.addEventListener('click', async () => {
        const newLink = editLinkInput.value.trim();
      

        const authToken = localStorage.getItem('authToken');

        if (newLink) {
            // Make request to update link
            try {
                const response = await fetch(`/.netlify/functions/updateSocialLink`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({socialMedia: currentSocialMedia, newLink: newLink })
                });

                if (!response.ok) {
                    throw new Error('Failed to update link');
                }
                // Handle success
            } catch (error) {
                console.error(error);
                // Handle error
            }
            hideEditLinkInputBox(); // Hide input box after submission
        }
    });

    // Event listener to hide context menu when clicking outside
       // Event listener to hide context menu when clicking outside
       document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
            hideEditLinkInputBox();
        }
    });

    // Stop event propagation when clicking inside the input box
    editLinkInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const userPhoto = document.getElementById('userPhoto');
    const photoOptions = document.getElementById('photoOptions');
    const uploadPhotoOption = document.getElementById('uploadPhotoOption');
    const removePhotoOption = document.getElementById('removePhotoOption');

    // Function to toggle the visibility of the photo options box
    function togglePhotoOptions() {
        photoOptions.style.display = photoOptions.style.display === 'block' ? 'none' : 'block';
    }

    // Show/hide photo options on click
    userPhoto.addEventListener('click', function(event) {
        togglePhotoOptions();
        event.stopPropagation(); // Prevent the click event from bubbling up
    });

    // Hide photo options when clicking outside
    document.addEventListener('click', function() {
        photoOptions.style.display = 'none';
    });

    // Prevent hiding photo options when clicking inside the options
    photoOptions.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Upload photo option
    uploadPhotoOption.addEventListener('click', function() {
        // Trigger file input element click event
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*'; // Accept image files only
        fileInput.addEventListener('change', async function(event) {
            const file = event.target.files[0]; // Get the selected file
            const userId = getCookie('UserId');

            if (file) {
                await handleFileUpload(file, userId); // Handle the file upload
            }
        });
        fileInput.click();
    });

    // Remove photo option
    // Remove photo option
    removePhotoOption.addEventListener('click', async function() {
        const photoName = userPhoto.src.split('/').pop(); // Get the photo name from the src attribute
    
        try {
            // Get authentication token from local storage
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Authorization token not found');
            }
    
            // Send request to remove photo
            const response = await fetch("/.netlify/functions/remove-photo", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Include authentication token in headers
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ photoName: photoName }) // Include photo name in the request body
            });
        if (!response.ok) {
            throw new Error('Failed to remove photo');
        }
        const data = await response.json();
        // Reload the page or update UI as needed
    } catch (error) {
        console.error(error); // Log error message
    }
});

});

// Function to handle file upload
async function handleFileUpload(file) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        throw new Error('Authorization token not found');
    }

    try {
        // Read the file content
        const fileContent = await readFileAsArrayBuffer(file);

        const response = await fetch("/.netlify/functions/upload-photo", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': file.type // Set content type to the file's MIME type
            },
            body: fileContent // Send file content directly
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload photo');
        }
        
        const data = await response.json();
    } catch (error) {
        console.error(error); // Log error message
    }
}

// Function to read file content as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
}



function showSection(sectionId) {
    // Hide all section contents
    const sectionContents = document.querySelectorAll('.section-content');
    sectionContents.forEach(content => {
        content.style.display = 'none';
    });

    // Display selected section content
    const selectedSection = document.getElementById(sectionId);
    selectedSection.style.display = 'block';

    // Remove 'active' class from all section links
    const sectionLinks = document.querySelectorAll('.section');
    sectionLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Add 'active' class to selected section link
    const selectedLink = document.querySelector(`.section[data-section="${sectionId}"]`);
    selectedLink.classList.add('active');
}

document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Retrieve authentication token from localStorage
        const authToken = localStorage.getItem('authToken');

        // Check if authToken exists
        if (!authToken) {
            throw new Error('Authentication token not found');
        }

        // Include authentication token in the fetch request headers
        const response = await fetch(`/.netlify/functions/profile`, {
            headers: {
                'Authorization': authToken
            }
        });

        // Check if fetch request was successful

        // Parse response data as JSON
        const userData = await response.json();
        const user = userData; // Assuming you only have one user for simplicity

        // Update HTML elements with user data
        document.getElementById('name').textContent = user.username;
        document.getElementById('dob').textContent = user.dob;
        document.getElementById('email').textContent = user.email;
        document.getElementById('Uname').textContent = user.username;

        // Set user photo src if available
        const userPhoto = document.getElementById('userPhoto');
        if (user.Picture) {
            userPhoto.src = user.Picture; // Use the Picture field if available
        } else {
            // If Picture field is not available, set default profile photo
            userPhoto.src = 'images/users/default.png'; // Provide the default photo path
        }

        // Fetch social media links and update the icons' href attributes
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            const socialMedia = link.dataset.socialMedia;
            if (user.social && user.social[socialMedia]) {
                link.href = user.social[socialMedia]; // Update href attribute
            }
        });

        // Update projects list
        const projectsList = document.getElementById('projectList');
        if (projectsList) {
            projectsList.innerHTML = ''; // Clear previous projects

            if (user.projects && user.projects.length > 0) {
                user.projects.forEach(project => {
                    const li = document.createElement('li');
                    li.textContent = project.name;
                    projectsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No projects yet';
                projectsList.appendChild(li);
            }
        } else {
            throw new Error('Element with ID "projectList" not found.');
        }
    } catch (error) {
        console.error(error);
        // Handle error
    }
});



document.addEventListener("DOMContentLoaded", function() {
    const addProjectButton = document.getElementById("addProjectButton");

    addProjectButton.addEventListener("click", async function() {
        const newProjectInput = document.getElementById("newProjectInput");
        const projectName = newProjectInput.value.trim();
    
        if (projectName) {
            try {
                // Extract the token from local storage
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('Authorization token not found');
                }
    
                const response = await fetch("/.netlify/functions/projects", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                    },
                    body: JSON.stringify({ name: projectName }) // userId is already extracted from the token on the server side
                });
    
                if (!response.ok) {
                    throw new Error('Failed to add project');
                }
    
                const project = await response.json();

                // Add the new project to the list
                const projectList = document.getElementById("projectList");
                const newProjectItem = document.createElement("li");
                newProjectItem.textContent = project.name;
                projectList.appendChild(newProjectItem);

                // Clear input field
                newProjectInput.value = '';
            } catch (error) {
                console.error(error);
                // Handle error
            }
        }
    });
});

// Function to retrieve cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


document.addEventListener("DOMContentLoaded", async function() {
  const confirmationDialog = document.getElementById('confirm-dialog');
  const confirmDeleteButton = document.getElementById('confirm-del');
  const cancelDeleteButton = document.getElementById('cancel-del');
  

  // Function to show confirmation dialog
  function showConfirmationDialog() {
      confirmationDialog.style.display = 'block';
  }

  // Function to hide confirmation dialog
  function hideConfirmationDialog() {
      confirmationDialog.style.display = 'none';
  }
  async function deletePastEvents() {
    try {
        // Get authentication token from cookie
        const authToken = localStorage.getItem('authToken');


   
        // Fetch events from the server with authentication token
        const response = await fetch("/.netlify/functions/calendar", {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const eventsData = await response.json();
        

        // Get today's date
        const today = new Date();
        // Filter events to keep only the ones whose date is equal to or greater than today
        const eventsToKeep = eventsData.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
        });

        // Get IDs of events to delete
        const eventsToDelete = eventsData.filter(event => !eventsToKeep.includes(event)).map(event => event._id);
        

        // Delete events from the database
        for (const eventId of eventsToDelete) {
           
            const deleteResponse = await fetch(`/.netlify/functions/delete-event/${eventId}`, {
                method: 'DELETE'
            });
            if (!deleteResponse.ok) {
                throw new Error(`Failed to delete event with ID ${eventId}`);
            }
            
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Handle error
    }
}

  // Function to fetch and display upcoming events
  // Function to fetch and display upcoming events
  async function fetchAndDisplayEvents() {
    
    try {
        const authToken = localStorage.getItem('authToken');


        if (!authToken) {
            throw new Error('token not provided');
        }

        const response = await fetch("/.netlify/functions/calendar", {
            headers: {
                'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

      const eventsData = await response.json();
      const upcomingEventsList = document.getElementById('upcoming-events-list');
      const comfirmationDiaglog = document.getElementById('confirm-dialog')
      upcomingEventsList.innerHTML = ''; // Clear previous events

      // Group events based on date
      const groupedEvents = groupEventsByDate(eventsData);

      // Sort grouped events by date
      const sortedDates = Object.keys(groupedEvents).sort();

      // Get today's date
      const today = new Date();

      // Loop through sorted dates and create list items for upcoming events
      sortedDates.forEach(date => {
          const eventsForDate = groupedEvents[date];
          const eventDate = new Date(date);

          // Only display events for dates that are equal to or greater than today
          if (eventDate >= today) {
              const dayDifference = getDayDifference(date); // Get day difference from today
              
              // Create heading for the date
              const dateHeading = document.createElement('h3');
              dateHeading.textContent = (dayDifference === 0 ? 'Today' : `${dayDifference} day${dayDifference > 1 ? 's' : ''} later`);
              upcomingEventsList.appendChild(dateHeading);

              // Loop through events for the date and create list items
              eventsForDate.forEach(event => {
                  // Extracting title, date, and time from each event
                  const title = event.title;
                  const time = event.time;
                  const eventId = event._id; // Extract event ID

                  // Creating list item element
                  const li = document.createElement('li');
                  li.textContent = `${title} - ${time}`;

                  // Creating delete button element
                  const deleteButton = document.createElement('button');
                  deleteButton.textContent = 'Delete'; // Text content changed to "Delete"
                  deleteButton.classList.add('delete-event'); // Add a class for styling
                  deleteButton.dataset.id = eventId; // Add event ID to data-id attribute
                  deleteButton.addEventListener('click', async function() {
                      // Show confirmation dialog when delete button is clicked
                     
                      showConfirmationDialog();
                  });

                  // Appending delete button to the list item
                  li.appendChild(deleteButton);

                  // Appending list item to the list
                  upcomingEventsList.appendChild(li);
              });
          }
      });
      await deletePastEvents();

  } catch (error) {
      console.error(error);
      // Handle error
  }
}

  // Call the function to fetch and display upcoming events when the page loads
  fetchAndDisplayEvents();

  // Event listener for form submission
  document.getElementById('add-event-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission

    // Get form input values
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;

    try {
        // Get authentication token from cookie
        const authToken = localStorage.getItem('authToken');


        // Send a POST request to add the new event to the database with authentication
        const response = await fetch("/.netlify/functions/add-event", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
            },
            body: JSON.stringify({
                title,
                date,
                time,
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add event');
        }

          // After adding the event, fetch and display updated upcoming events
          await fetchAndDisplayEvents();

          // Clear the form inputs
          document.getElementById('event-title').value = '';
          document.getElementById('event-date').value = '';
          document.getElementById('event-time').value = '';
      } catch (error) {
          console.error(error);
          // Handle error
      }
  });

  // Event listener for confirm delete button
  confirmDeleteButton.addEventListener('click', async function() {
    
      try {
          // Get event ID from the delete button dataset
          const eventId = document.querySelector('.delete-event').dataset.id;

          // Send request to delete event
          const deleteResponse = await fetch(`/.netlify/functions/delete-event/${eventId}`, {
              method: 'DELETE'
          });
          if (!deleteResponse.ok) {
              throw new Error('Failed to delete event');
          }

          // After deleting the event, fetch and display updated upcoming events
          await fetchAndDisplayEvents();

          // Hide confirmation dialog after successful delete
          hideConfirmationDialog();
      } catch (error) {
          console.error(error);
          // Handle error
      }
  });

  // Event listener for cancel delete button
  cancelDeleteButton.addEventListener('click', function() {
      // Hide confirmation dialog when cancel button is clicked
      hideConfirmationDialog();
  });

  // Function to group events by date
  function groupEventsByDate(events) {
      return events.reduce((acc, event) => {
          const date = event.date;
          if (!acc[date]) {
              acc[date] = [];
          }
          acc[date].push(event);
          return acc;
      }, {});
  }

  // Function to get day difference from today for a given date
  function getDayDifference(dateString) {
      const today = new Date();
      const eventDate = new Date(dateString);
      const differenceInTime = eventDate.getTime() - today.getTime();
      const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));
      return differenceInDays;
  }
});



document.addEventListener("DOMContentLoaded", async function() {
    const transactionForm = document.getElementById('transaction-form');
    const currentMonthSummaryHeading = document.getElementById('current-month-summary');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Initialize the current month name
    let currentMonth = getCurrentMonthName();

    // Update the heading to display the current month's summary
    currentMonthSummaryHeading.textContent = currentMonth + ' Summary';

    // Event listener for form submission
    transactionForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        // Get form input values
        const type = document.getElementById('transaction-type').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const authToken = localStorage.getItem('authToken');


        try {
            // Send a POST request to add the new transaction to the database
            const response = await fetch("/.netlify/functions/add-transaction", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
                },
                body: JSON.stringify({
                    type,
                    amount,
                    currentMonth
            
                })
            });
            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }

            // After adding the transaction, refresh the transaction history
            await fetchAndDisplayTransactions();
                    // Clear input boxes after successful submission
  
        document.getElementById('transaction-amount').value = '';

        } catch (error) {
            console.error(error);
            // Handle error
        }
    });

    // Event listener for the "<" button to navigate to the previous month
    prevMonthButton.addEventListener('click', async function() {
        // Get the index of the current month in the months array
        const currentMonthIndex = months.indexOf(currentMonth);
        // Calculate the index of the previous month
        const prevMonthIndex = (currentMonthIndex - 1 + months.length) % months.length;
        // Update the current month to the previous month
        currentMonth = months[prevMonthIndex];
        // Update the heading to display the updated month's summary
        currentMonthSummaryHeading.textContent = currentMonth + ' Summary';
        // Fetch and display transactions for the updated month
        await fetchAndDisplayTransactions();
    });

    // Event listener for the ">" button to navigate to the next month
    nextMonthButton.addEventListener('click', async function() {
        // Get the index of the current month in the months array
        const currentMonthIndex = months.indexOf(currentMonth);
        // Calculate the index of the next month
        const nextMonthIndex = (currentMonthIndex + 1) % months.length;
        // Update the current month to the next month
        currentMonth = months[nextMonthIndex];
        // Update the heading to display the updated month's summary
        currentMonthSummaryHeading.textContent = currentMonth + ' Summary';
        // Fetch and display transactions for the updated month
        await fetchAndDisplayTransactions();
    });

    // Function to fetch and display transaction history
    async function fetchAndDisplayTransactions() {
        try {
            // Get authentication token from localStorage
            const authToken = localStorage.getItem('authToken');
            const currentMonth = getCurrentMonthName(); // Assuming getCurrentMonth() is defined elsewhere
            
            // Send a GET request to fetch transactions for the current month with authentication token
            const response = await fetch(`/.netlify/functions/transactions?month=${currentMonth}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
    
            const transactionsData = await response.json();
            const transactionList = document.getElementById('transaction-list');
            transactionList.innerHTML = ''; // Clear previous transactions

            // Loop through transactions data and create list items for transaction history
            transactionsData.forEach(transaction => {
                // Extracting type and amount from each transaction
                const type = transaction.type;
                const amount = transaction.amount;

                // Creating list item element
                const li = document.createElement('li');
                li.textContent = `${type}: NPR${amount.toFixed(2)}`;

                // Appending list item to the list
                transactionList.appendChild(li);
            });

            // Calculate and display total expenses and total income
            const totalExpenses = transactionsData.filter(transaction => transaction.type === 'expense')
                .reduce((total, transaction) => total + transaction.amount, 0);
            const totalIncome = transactionsData.filter(transaction => transaction.type === 'income')
                .reduce((total, transaction) => total + transaction.amount, 0);
            document.getElementById('total-expenses').textContent = `NPR${totalExpenses.toFixed(2)}`;
            document.getElementById('total-income').textContent = `NPR${totalIncome.toFixed(2)}`;
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    // Call the function to fetch and display transaction history when the page loads
    fetchAndDisplayTransactions();
});

// Function to get the name of the current month
function getCurrentMonthName() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    return months[currentDate.getMonth()];
}




document.addEventListener("DOMContentLoaded", async function() {

    // Function to fetch and display tasks
    async function fetchAndDisplayTasks() {
        try {
            // Get authentication token from localStorage
            const authToken = localStorage.getItem('authToken');

            // Send a GET request to fetch tasks with authentication token
            const response = await fetch("/.netlify/functions/tasks", {
                headers: {
                    'Authorization': `Bearer ${authToken}` // Include the authentication token in the 'Authorization' header
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasksData = await response.json();
            displayTasks(tasksData);
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    // Function to display tasks
    function displayTasks(tasks) {
        const todoList = document.querySelector('.todo-list');
        const inProgressList = document.querySelector('.in-progress-list');
        const completedList = document.querySelector('.completed-list');

        todoList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';

            // Loop through tasks and display them in the appropriate section
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.name;
  
                // Add a delete button to each task
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-task-button');
                deleteButton.dataset.id = task._id;
                deleteButton.addEventListener('click', async function() {
                    try {
                        // Send a DELETE request to remove the task from the database
                        const response = await fetch(`/.netlify/functions/delete-task/${task._id}`, {
                            method: 'DELETE'
                        });
                        if (!response.ok) {
                            throw new Error('Failed to delete task');
                        }
  
                        // After deleting the task, refresh the task lists
                        await fetchAndDisplayTasks();
                    } catch (error) {
                        console.error(error);
                        // Handle error
                    }
                });
  
                li.appendChild(deleteButton);
           
            if (task.status === 'todo') {
                const startButton = document.createElement('button');
                startButton.textContent = 'Start';
                startButton.addEventListener('click', async () => {
                    await updateTaskStatus(task._id, 'in-progress');
                    fetchAndDisplayTasks();
                });
                li.appendChild(startButton);
                todoList.appendChild(li);
            } else if (task.status === 'in-progress') {
                const completeButton = document.createElement('button');
                completeButton.textContent = 'Complete';
                completeButton.addEventListener('click', async () => {
                    await updateTaskStatus(task._id, 'completed');
                    fetchAndDisplayTasks();
                });
                li.appendChild(completeButton);
                inProgressList.appendChild(li);
            } else if (task.status === 'completed') {
                completedList.appendChild(li);
            }
        });
    }

    // Function to update task status
    async function updateTaskStatus(taskId, status) {
        try {
            const response = await fetch(`/.netlify/functions/update-task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (!response.ok) {
                throw new Error('Failed to update task status');
            }
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    // Event listener for form submission
    const taskForm = document.getElementById('add-task-form');
    taskForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        const taskNameInput = document.getElementById('task-name');
        const taskName = taskNameInput.value.trim();
        const authToken = localStorage.getItem('authToken');

        if (taskName === '') {
            alert('Task name cannot be empty');
            return;
        }

        try {
            const response = await fetch("/.netlify/functions/add-task", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: taskName, status: 'todo' })
            });
            if (!response.ok) {
                throw new Error('Failed to add task');
            }
            taskNameInput.value = ''; // Clear input field after adding task
            fetchAndDisplayTasks(); // Refresh task list after adding task
        } catch (error) {
            console.error(error);
            // Handle error
        }
    });

    // Call the function to fetch and display tasks when the page loads
    fetchAndDisplayTasks();
});

document.addEventListener('DOMContentLoaded', () => {
    const openButtons = document.querySelectorAll('.open-popup-button');
    const popupContainer = document.querySelector('.popup-container');
    const linkInput = document.getElementById('linkInput');
    const submitButton = document.getElementById('submitButton');
    const pleaseWaitMessage = document.getElementById('pleaseWaitMessage');
    const closePopupButton = document.getElementById('closeButtonPopup')
    const videoInfo = document.getElementById('videoInfo');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const downloadButton = document.getElementById('downloadButton');
    const popupTitle = document.getElementById('popupTitle'); // Add this line


    // Reset popup function
    const resetPopup = () => {
        linkInput.value = '';
        pleaseWaitMessage.style.display = 'none';
        videoInfo.style.display = 'none';
        videoThumbnail.src = '';
        videoTitle.textContent = '';
        downloadButton.href = '';
        linkInput.style.display = 'block';
        submitButton.style.display = 'block';
  
    };

    // Function to set the submit button ID
    function setSubmitButton(submitButtonId) {
        submitButton.setAttribute("id", submitButtonId);
    }

    function setPopupTitle(buttonId) {
        if (buttonId === 'openMusicPopup') {
            popupTitle.textContent = 'Music Downloader';
        } else if (buttonId === 'openVideoPopup') {
            popupTitle.textContent = 'Video Downloader';
        }
    }

    // Event listener for open buttons
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            popupContainer.style.display = 'block';
            if (button.id === 'openMusicPopup') {
                downloadType = 'musicSubmit';
            } else {
                downloadType = 'videoSubmit';
            }
            setSubmitButton(downloadType); // Set the submit button ID based on the download type
            setPopupTitle(button.id);
        });
    });

    // Event listener for close button
    closePopupButton.addEventListener('click', () => {
        popupContainer.style.display = 'none';
        resetPopup();
    });

    // Event listener for the download button
    downloadButton.addEventListener('click', () => {
        // Hide the "Download Another" button
        const downloadAnotherButton = document.getElementById('downloadAnotherButton');
        downloadButton.textContent = 'downloading...';
        downloadAnotherButton.style.display = 'block';
    });

    // Event listener for submit button
    submitButton.addEventListener('click', async () => {
        const link = linkInput.value.trim();
        const submitButtonId = submitButton.id;

        if (link) {
            pleaseWaitMessage.style.display = 'block'; // Show "Please wait" message

            let type = '';

            // Set the type based on the submit button ID
            if (submitButtonId === 'videoSubmit') {
                type = 'video';
            } else if (submitButtonId === 'musicSubmit') {
                type = 'music';
            }

            // Send POST request to fetch video info with the determined type
            fetch("/.netlify/functions/get-video-info", {
                method: 'POST',
                headers: {
                    
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ link: link, type: type }) // Include the type in the request body
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch video info');
                    }
                    return response.json();
                })
                .then(data => {
                    // Display video info or music conversion info based on the submit button ID
                    if (submitButtonId === 'videoSubmit') {
                        videoThumbnail.src = data.thumbnail;
                        videoTitle.textContent = data.title;
                        downloadButton.href = `${window.location.origin}${data.downloadLink}`;
                        downloadButton.textContent = 'download...';
                    } else if (submitButtonId === 'musicSubmit') {
                        // Show the convert button and hide the download button
                       

                        videoThumbnail.src = data.thumbnail;
                        videoTitle.textContent = data.title;
                        downloadButton.href = `${window.location.origin}${data.downloadLink}`;
                        downloadButton.textContent = 'download...';
                    }

                    // Common display adjustments
                    videoInfo.style.display = 'block';
                    linkInput.style.display = 'none';
                    submitButton.style.display = 'none';
                    pleaseWaitMessage.style.display = 'none'; // Hide "Please wait" message
                })
                .catch(error => {
                    console.error('Error:', error.message);
                    // Display error message or handle accordingly
                    pleaseWaitMessage.style.display = 'none'; // Hide "Please wait" message
                });
        } else {
            // Display error message or handle accordingly
            console.error('Invalid YouTube link');
        }
    });

  

    // Event listener for "Download Another" button
    const downloadAnotherButton = document.getElementById('downloadAnotherButton');
    downloadAnotherButton.addEventListener('click', () => {
        resetPopup();
        popupContainer.style.display = 'block';
        downloadAnotherButton.style.display = 'none'; // Hide the button again
    });
});


/********************************************************LOGIN PAGE******************************************************************/
// Add event listener to the logout button
const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', async function() {
    try {
        const response = await fetch("/.netlify/functions/logout", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' 
        });
        if (!response.ok) {
            throw new Error('Failed to logout');
        }
        // Clear the UserId cookie
        
        document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'AccountId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        // Clear auth token from local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('accountId');


        // Redirect the user to the login page
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error logging out:', error);
        // Handle error
    }
});



document.addEventListener("DOMContentLoaded", function() {
    const deleteAccountButton = document.getElementById('deleteAccountButton');
    const confirmationDialog = document.getElementById('confirmation-dialog');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    deleteAccountButton.addEventListener('click', function() {
        confirmationDialog.style.display = 'block'; // Show the confirmation dialog
    });

    // Event listener for the confirm delete button
    confirmDeleteButton.addEventListener('click', async function() {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Authorization token not found');
            }
    
            const response = await fetch("/.netlify/functions/delete-account", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({}) 
            });
            if (!response.ok) {
                throw new Error('Failed to delete account');
            }
            const data = await response.json();
            document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            // Clear auth token from local storage
            localStorage.removeItem('authToken');
           
        } catch (error) {
            console.error(error); // Log error message
        }
        confirmationDialog.style.display = 'none'; // Hide the confirmation dialog
    });

    // Event listener for the cancel delete button
    cancelDeleteButton.addEventListener('click', function() {
        confirmationDialog.style.display = 'none'; // Hide the confirmation dialog
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const changeEmailLink = document.querySelector('.change-email-link');
    const emailModal = document.getElementById('email-change-modal');
    const emailCloseButton = document.querySelector('#email-change-modal .close');
    const emailForm = document.getElementById('email-form');

    const changePasswordLink = document.querySelector('.change-password');
    const passwordModal = document.getElementById('password-change-modal');
    const passwordCloseButton = document.querySelector('#password-change-modal .close');
    const passwordForm = document.getElementById('password-form');

    // Display email modal when change email link is clicked
    changeEmailLink.addEventListener('click', function (e) {
        e.preventDefault();
        emailModal.style.display = 'block';
    });

    // Close email modal when the close button is clicked
    emailCloseButton.addEventListener('click', function () {
        emailModal.style.display = 'none';
    });

    // Close email modal when clicked outside of it
    window.addEventListener('click', function (e) {
        if (e.target === emailModal) {
            emailModal.style.display = 'none';
        }
    });

    // Submit the form to change email
    emailForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const newEmail = document.getElementById('new-email').value;

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token not found.');
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/change-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newEmail })
            });
            const data = await response.json();
            if (response.ok) {
                // Email changed successfully, update the displayed email
                document.getElementById('email').textContent = newEmail;
                // Close the modal
                emailModal.style.display = 'none';
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Display password modal when "Change password?" link is clicked
    changePasswordLink.addEventListener('click', function (e) {
        e.preventDefault();
        passwordModal.style.display = 'block';
    });

    // Close password modal when the close button is clicked
    passwordCloseButton.addEventListener('click', function () {
        passwordModal.style.display = 'none';
    });

    // Submit the form to change password
    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmNewPassword) {
            alert('New passwords do not match!');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Authorization token not found.');
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Success message
                // Clear input fields
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-new-password').value = '';
            } else {
                alert(data.message); // Error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});

