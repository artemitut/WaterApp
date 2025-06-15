window.addEventListener("DOMContentLoaded", function () {
  const oldPasswordInput = document.getElementById("old_password");
  const newPasswordInput = document.getElementById("new_password");
  const newPassword2Input = document.getElementById("new_password2");
  const submitBtn = document.querySelector(".change_password__button");

  const toggles = [
    {
      checkbox: document.getElementById("passwordCheckbox"),
      input: oldPasswordInput,
    },
    {
      checkbox: document.getElementById("passwordCheckbox2"),
      input: newPasswordInput,
    },
    {
      checkbox: document.getElementById("passwordCheckbox3"),
      input: newPassword2Input,
    },
  ];

  // Функція для перемикання типу пароля та зміни іконки
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

  // Функція для перевірки паролів
  function validate() {
    const oldPasswordNotEmpty = oldPasswordInput.value.trim().length > 0;
    const newPasswordNotEmpty = newPasswordInput.value.trim().length > 4;
    const newPasswordsAreEqual =
      newPasswordInput.value === newPassword2Input.value;

    if (oldPasswordNotEmpty && newPasswordNotEmpty && newPasswordsAreEqual) {
      submitBtn.disabled = false;
      submitBtn.classList.add("change_password__button_active");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove("change_password__button_active");
    }
  }

  oldPasswordInput.addEventListener("input", validate);
  newPasswordInput.addEventListener("input", validate);
  newPassword2Input.addEventListener("input", validate);

  submitBtn.disabled = true;
});
