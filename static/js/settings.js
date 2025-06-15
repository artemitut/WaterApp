const dataInput = document.getElementById("inputWaterCount");
const form = document.querySelector("form");
const button = document.querySelector(".settings__form__button");

dataInput.addEventListener("input", function () {
  let value = dataInput.value.replace(/\D/g, "");

  if (value !== "") {
    dataInput.value = value + " мл";
  }
});

dataInput.addEventListener("input", function () {
  let value = dataInput.value.replace(/\D/g, "");

  if (value !== "") {
    dataInput.value = value + " мл";
    button.classList.add("settings__form__button_active");
    button.innerHTML = `Встановити ціль на день ${value} мл`;
    const pos = value.length;
    button.disable = false;
    dataInput.setSelectionRange(pos, pos);
  } else {
    dataInput.value = "";
    button.classList.remove("settings__form__button_active");
    button.textContent = "Встановити ціль на день 0 мл";
    button.disable = true;
  }
});

form.addEventListener("submit", function (e) {
  const numericOnly = dataInput.value.replace(/\D/g, "");
  if (
    numericOnly === "" ||
    Number.parseInt(dataInput.value) > 5000 ||
    Number.parseInt(dataInput.value) < 1
  ) {
    e.preventDefault();
    dataInput.value = "";
    eigenvalue.classList.remove("eigenvalue_active");
    eigenvalue.textContent = "Встановити ціль на день 0 мл";
    return;
  }
  dataInput.value = numericOnly;
});
