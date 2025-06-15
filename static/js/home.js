window.addEventListener("DOMContentLoaded", () => {
  const alreadyEl = document.querySelector(".home__already");
  const leftEl = document.querySelector(".home__left");
  const brLeft = document.getElementById("brLeft");
  const brAlready = document.getElementById("brAlready");
  const leftSpan = document.querySelector(".home__left__span");
  const alreadySpan = document.querySelector(".home__already__span");

  const percentAlready = parseInt(alreadyEl.dataset.fill);
  const percentLeft = parseInt(leftEl.dataset.fill);

  const alreadyMl = parseInt(alreadyEl.dataset.already);
  const leftMl = parseInt(leftEl.dataset.left);

  alreadyEl.style.height = `${percentAlready}%`;
  leftEl.style.height = `${percentLeft}%`;

  if (percentAlready <= 10 && brAlready) {
    brAlready.style.display = "none";
    alreadySpan.style.paddingLeft = "1rem";
    alreadySpan.classList.add("home_already__text");
    alreadySpan.classList.remove("home__already__span");
  }

  if (percentLeft <= 10 && brLeft) {
    brLeft.style.display = "none";
    leftSpan.style.paddingLeft = "1rem";
    leftSpan.classList.add("home_left__text");
    leftSpan.classList.remove("home__left__span");
  }
});

const form = document.getElementById("waterForm");
const dataInput = document.getElementById("inputWaterCount");
const openBtn = document.getElementById("addWaterBtn");
const eigenvalue = document.getElementById("eigenvalue");

const header = document.querySelector("header");
const main = document.querySelector("main");
const footer = document.querySelector("footer");

function submitWithValue(value) {
  dataInput.value = value;
  form.submit();
}

function submitWithInput() {
  form.submit();
}

dataInput.addEventListener("input", function () {
  let value = dataInput.value.replace(/\D/g, "");

  if (value !== "") {
    dataInput.value = value + " мл";
    eigenvalue.classList.add("eigenvalue_active");
    eigenvalue.innerHTML =
      `<svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 0H21V36H15V0Z" fill="#D9D9D9" />
      <path d="M36 15V21L0 21L2.62268e-07 15L36 15Z" fill="#D9D9D9" />
    </svg>` +
      value +
      " мл";
    const pos = value.length;
    dataInput.setSelectionRange(pos, pos);
  } else {
    dataInput.value = "";
    eigenvalue.classList.remove("eigenvalue_active");
    eigenvalue.textContent = "+ 0 мл";
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
    eigenvalue.textContent = "+ 0 мл";
    return;
  }
  dataInput.value = numericOnly;
});

openBtn.addEventListener("click", () => {
  waterForm.classList.add("active");

  header.classList.add("blur");
  main.classList.add("blur");
  footer.classList.add("blur");
});

document.addEventListener("click", (e) => {
  if (
    waterForm.classList.contains("active") &&
    !waterForm.contains(e.target) &&
    e.target !== openBtn
  ) {
    e.preventDefault();
    waterForm.classList.remove("active");

    header.classList.remove("blur");
    main.classList.remove("blur");
    footer.classList.remove("blur");
  }
});
