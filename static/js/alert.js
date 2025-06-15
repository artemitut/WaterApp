const alert = document.querySelector(".alert");

if (alert) {
  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => {
      alert.style.display = "none";
    }, 500);
  }, 7000);
}
