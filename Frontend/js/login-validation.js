document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Clear previous messages
    clearMessages();

    let valid = true;

    // Validate Email
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        valid = false;
        showError('emailError', 'Email is required.');
    } else if (!emailPattern.test(email)) {
        valid = false;
        showError('emailError', 'Invalid email format.');
    }

    // Validate Password
    const password = document.getElementById('password').value.trim();
    if (password === '') {
        valid = false;
        showError('passwordError', 'Password is required.');
    }

    if (valid) {
        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError('emailError', data.error);
            } else {
                // Store JWT token and user data in local storage
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showSuccessMessage('Login successful!');
                // Redirect to dashboard
                setTimeout(() => window.location.href = '/frontend/dashboard.html', 2000); 
            }
        })
        .catch(error => {
            console.error('An unexpected error occurred:', error);
            showError('emailError', 'An unexpected error occurred. Please try again.');
        });
    }
});

function clearMessages() {
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
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
