window.addEventListener("DOMContentLoaded", () => {
  const dayNames = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "П'ятниця",
    "Субота",
  ];
  const monthNames = [
    "січня",
    "лютого",
    "березня",
    "квітня",
    "травня",
    "червня",
    "липня",
    "серпня",
    "вересня",
    "жовтня",
    "листопада",
    "грудня",
  ];

  const today = new Date();
  const dayName = dayNames[today.getDay()];
  const dayNumber = today.getDate();
  const monthName = monthNames[today.getMonth()];

  document.querySelector(".header__date__day").textContent = dayName;
  document.querySelector(
    ".header__date__num"
  ).textContent = `${dayNumber} ${monthName}`;
});
