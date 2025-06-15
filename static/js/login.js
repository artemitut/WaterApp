const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const passwordCheckbox = document.getElementById("passwordCheckbox");
let isPassShown = false;

function validate() {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
  const passwordNotEmpty = passwordInput.value.trim().length > 4;

  if (emailValid && passwordNotEmpty) {
    submitBtn.disabled = false;
    submitBtn.classList.add("login__button_active");
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove("login__button_active");
  }
}

emailInput.addEventListener("input", validate);
passwordInput.addEventListener("input", validate);
passwordCheckbox.addEventListener("click", () => {
  if (!isPassShown) {
    passwordInput.type = "text";
    passwordCheckbox.style.backgroundImage = "url('/static/images/eye.svg')";
    isPassShown = true;
  } else {
    passwordInput.type = "password";
    passwordCheckbox.style.backgroundImage = "url('/static/images/eye2.svg')";
    isPassShown = false;
  }
});
