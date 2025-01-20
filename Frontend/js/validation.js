document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission

  // Clear previous error messages
  clearErrorMessages();

  let valid = true;

  // Validate Full Name
  const name = document.getElementById('name').value.trim();
  if (name === '') {
    valid = false;
    showError('nameError', 'Full Name is required.');
  }

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
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (password === '') {
    valid = false;
    showError('passwordError', 'Password is required.');
  } else if (!passwordPattern.test(password)) {
    valid = false;
    showError('passwordError', 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
  }

  // Validate Repeat Password
  const repeatPassword = document.getElementById('repeat-password').value.trim();
  if (repeatPassword !== password) {
    valid = false;
    showError('repeatPasswordError', 'Passwords do not match.');
  }

});

function clearErrorMessages() {
  document.getElementById('nameError').textContent = '';
  document.getElementById('emailError').textContent = '';
  document.getElementById('passwordError').textContent = '';
  document.getElementById('repeatPasswordError').textContent = '';
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
