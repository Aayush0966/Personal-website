document.addEventListener("DOMContentLoaded", function () {
    const loginIndicator = document.querySelector(".login-indicator");
    const registerIndicator = document.querySelector(".register-indicator");
    const loginBox = document.getElementById("login-box");
    const registerBox = document.getElementById("register-box");

    loginIndicator.addEventListener("click", function () {
        loginIndicator.classList.add("active");
        registerIndicator.classList.remove("active");
        loginBox.classList.remove("hidden");
        registerBox.classList.add("hidden");
    });

    registerIndicator.addEventListener("click", function () {
        registerIndicator.classList.add("active");
        loginIndicator.classList.remove("active");
        registerBox.classList.remove("hidden");
        loginBox.classList.add("hidden");
    });
    window.addEventListener('load', async () => {
        try {
            // Retrieve the JWT token from local storage
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Show the modal popup
                
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
    
            if (data.authenticated) {
                // Show the modal popup
                redirectToLogin()
            }
        } catch (error) {
            
        }
    });
    
    // Function to redirect to login page
    function redirectToLogin() {
        window.location.href = '/home';
        
    }
    // Function to handle registration form submission
function registerUser(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get user input values
    const newUsername = document.getElementById("newUsername").value;
    const email = document.getElementById("email").value;
    const dob = document.getElementById("dob").value;
    const newPassword = document.getElementById("newPassword").value;

    // Simulate sending registration data to a server
    fetch("/.netlify/functions/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: newUsername,
            email: email,
            dob: dob,
            password: newPassword,
        }),
    })
    .then(async response => { // Mark the callback function as async
        if (response.ok) {
            
            const data = await response.json();
            showAlert(data.message, 'success'); // Show success alert
            clearForm(); // Clear the form
        } else {
            console.error("Failed to register user");
            showAlert('Failed to register user', 'error'); // Show error alert
        }
    })
    .catch(error => {
        console.error("Error registering user:", error);
        showAlert('Error registering user', 'error'); // Show error alert
    });
}

// Function to clear the registration form
function clearForm() {
    document.getElementById("newUsername").value = "";
    document.getElementById("email").value = "";
    document.getElementById("dob").value = "";
    document.getElementById("newPassword").value = "";
}

// Add event listener to the registration form
const registerForm = document.querySelector("#register-box form");
registerForm.addEventListener("submit", registerUser);


    // Function to show an alert message
    // Function to show an alert message at the top of the document
function showAlert(message, type) {
    const alertElement = document.createElement('div');
    alertElement.textContent = message;
    alertElement.classList.add('alert');

    if (type === 'success') {
        alertElement.classList.add('alert-success');
    } else if (type === 'error') {
        alertElement.classList.add('alert-error');
    }

    // Prepend the alert element to the document body (at the top)
    document.body.insertBefore(alertElement, document.body.firstChild);

    // Remove the alert after a certain period of time (e.g., 5 seconds)
    setTimeout(() => {
        alertElement.remove();
    }, 5000); // 5000 milliseconds = 5 seconds
}

});

// Function to handle login form submission
async function loginUser(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get user input values
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;


    // Simulate sending login data to a server
    fetch("/.netlify/functions/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
        credentials: 'include'
    })
    .then(async response => { // Mark the callback function as async
        if (response.ok) {
            
            const data = await response.json();
          
            const token = data.token;
            const accountId = data.accountId;

            // Store token in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('accountId', accountId);
            // Redirect to home page
            window.location.href = '/home';

        
        } else {
            console.error("Failed to log in");
            alert('Invalid username or password', 'error'); // Show error alert
        }
    })
    .catch(error => {
        console.error("Error logging in:", error);
        alert('Error logging in', 'error'); // Show error alert
    });
}



// Add event listener to the login form
const loginForm = document.querySelector("#login-box form");
loginForm.addEventListener("submit", loginUser);


document.addEventListener('DOMContentLoaded', function() {
    // JavaScript to toggle password visibility
    const togglePassword = document.querySelectorAll('.toggle-password');
  
    togglePassword.forEach(function(button) {
      button.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye-slash');
        this.querySelector('i').classList.toggle('fa-eye');
      });
    });
  });



  function generateAccountIdCookie() {
    // Check if the accountId already exists in localStorage
    let accountId = localStorage.getItem('accountId');
    if (!accountId) {
        // If accountId doesn't exist, generate a new one
        accountId = Math.random().toString(36).substr(2, 9);
        // Set the cookie with an expiration date
        document.cookie = `accountId=${accountId}; expires=Sun, 31 Dec 2024 12:00:00 UTC;  path=/`;
        // Store the accountId in localStorage
        
    }
}

// Call the function to generate and store the accountId cookie when the page loads
generateAccountIdCookie();



