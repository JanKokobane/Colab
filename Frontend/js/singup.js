document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const repeatPassword = document.getElementById('repeat-password').value.trim();

    // Clear previous messages
    clearMessages();

    // Basic validation before sending request
    if (!name || !email || !password || !repeatPassword) {
        showError('nameError', 'All fields are required');
        return;
    }

    if (password !== repeatPassword) {
        showError('repeatPasswordError', 'Passwords do not match');
        return;
    }

    fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            if (data.error === 'User already exists') {
                showError('nameError', 'User already exists');
            } else {
                showError('nameError', 'An error occurred. Please try again.');
            }
        } else {
            showSuccessMessage('Account created successfully!');
            // Store JWT token and user data
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect to login page
            setTimeout(() => window.location.href = '/frontend/login.html', 2000); 
        }
    })
    .catch(error => {
        console.error('An unexpected error occurred:', error);
        showError('nameError', 'An unexpected error occurred. Please try again.');
    });
});

function clearMessages() {
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('repeatPasswordError').textContent = '';
    document.getElementById('successMessage').textContent = '';
    document.getElementById('successMessage').style.display = 'none';
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}
