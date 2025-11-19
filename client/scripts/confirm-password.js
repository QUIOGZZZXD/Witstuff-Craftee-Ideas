const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');
const confirmMessage = document.getElementById('confirmMessage');
const submitButton = document.getElementById('submitButton');

function validatePasswords() {
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;

    // Clear any existing messages and styling
    confirmMessage.textContent = '';
    confirmMessage.classList.remove('success-message', 'error-message');

    // Do not show any message and keep button disabled if password field is empty
    if (password === '') {
        submitButton.disabled = true;
        submitButton.style = 'cursor: not-allowed';
        return;
    }

    // Check if passwords match
    if (password === confirmPassword) {
        confirmMessage.textContent = 'Passwords match.';
        confirmMessage.classList.add('success-message');
        submitButton.disabled = false; // Enable the button
        submitButton.style = 'cursor: pointer';
    } else {
        confirmMessage.textContent = 'Passwords do not match.';
        confirmMessage.classList.add('error-message');
        submitButton.disabled = true; // Disable the button
        submitButton.style = 'cursor: not-allowed';
    }
}

// Add event listeners for the keyup event on both password fields
passwordField.addEventListener('keyup', validatePasswords);
confirmPasswordField.addEventListener('keyup', validatePasswords);
