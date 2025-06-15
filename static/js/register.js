// Отримуємо елементи
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const password2Input = document.getElementById("password-2");
const usernameInput = document.getElementById("username");
const submitBtn = document.getElementById("submitBtn");
const formBlock1 = document.querySelector(".register__form__block_1");
const formBlock2 = document.querySelector(".register__form__block_2");

const toggles = [
  {
    checkbox: document.getElementById("passwordCheckbox"),
    input: passwordInput,
  },
  {
    checkbox: document.getElementById("passwordCheckbox2"),
    input: password2Input,
  },
];

toggles.forEach(({ checkbox, input }) => {
  checkbox.addEventListener("click", function () {
    if (input.type === "password") {
      input.type = "text";
      checkbox.style.backgroundImage = "url('/static/images/eye.svg')";
    } else {
      input.type = "password";
      checkbox.style.backgroundImage = "url('/static/images/eye2.svg')";
    }
  });
});

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

// Функція валідації
const passwordNotEmpty = passwordInput.value.trim().length > 4;
const passwordIsEqual = passwordInput.value === password2Input.value;

if (emailValid && passwordNotEmpty && passwordIsEqual) {
  submitBtn.disabled = false;
  submitBtn.classList.add("register__button_active");
} else {
  submitBtn.disabled = true;
  submitBtn.classList.remove("register__button_active");
}

// Навішуємо прослуховувачі на поля для валідації в реальному часі
emailInput.addEventListener("input", validate);
passwordInput.addEventListener("input", validate);
password2Input.addEventListener("input", validate);

// Для відслідковування стану кнопки (чи ми на першому блоці, чи на другому)
let currentStep = 1;

// Обробка кліку по кнопці "Далі"/"Зареєструватися"
submitBtn.addEventListener("click", function (e) {
  // Якщо ми на першому блоці — не даємо формі відправитися
  if (currentStep === 1) {
    e.preventDefault();

    // Додаткова перевірка — якщо кнопка активна
    if (!submitBtn.disabled) {
      // Ховаємо блок 1, показуємо блок 2
      if (!submitBtn.disabled) {
        // Додаємо класи для анімації
        formBlock1.classList.add("slide-left");
        formBlock2.classList.add("slide-in");

        // Змінюємо кнопку
        submitBtn.textContent = "Зареєструватися";
        submitBtn.type = "submit"; // Тепер форма може відправитись
        currentStep = 2;
      }

      // Змінюємо кнопку
      submitBtn.textContent = "Зареєструватися";
      submitBtn.type = "submit"; // Тепер форма може відправитись
      currentStep = 2;
    }
  }
});
