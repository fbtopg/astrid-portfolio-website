const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNavigation = document.querySelector("#primary-navigation");
const navLinks = document.querySelectorAll("#primary-navigation a");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear().toString();
}

if (navToggle && primaryNavigation) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      primaryNavigation.classList.remove("is-open");
    });
  });
}
