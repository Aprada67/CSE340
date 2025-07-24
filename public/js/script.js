function togglePassword() {
  const passwordInput = document.getElementById('account_password');
  const toggleBtn = event.currentTarget;
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = 'Hide';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = 'Show';
  }
}
