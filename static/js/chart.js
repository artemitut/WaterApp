window.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".chart__nav__p");
  const slides = document.querySelectorAll(".chart__slide");

  navItems.forEach((navItem, index) => {
    navItem.addEventListener("click", function () {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - index) * 100}%)`;
      });

      navItems.forEach((p) => p.classList.remove("active"));
      navItem.classList.add("active");
    });
  });

  navItems[0].classList.add("active");
  slides.forEach((slide, i) => {
    slide.style.transform = `translateX(${i * 100}%)`;
  });

  document.querySelectorAll(".chart__note__del").forEach((delBtn) => {
    delBtn.addEventListener("click", () => {
      const id = delBtn.dataset.id;

      fetch("/chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      })
        .then((res) => {
          if (res.ok) {
            delBtn.closest(".chart__note").remove();
          } else {
            alert("Не вдалося видалити запис");
          }
        })
        .catch((error) => {
          console.error("Помилка:", error);
        });
    });
  });
});
