const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));


const journeySteps = [...document.querySelectorAll(".journey-step")];
const journeyProgress = document.getElementById("journeyProgress");

if (journeySteps.length && journeyProgress) {
  const journeyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");

        const activeCount = journeySteps.filter(step =>
          step.classList.contains("active")
        ).length;

        const journey = document.querySelector(".journey");
        const maxHeight = Math.max(0, journey.offsetHeight - 64);
        journeyProgress.style.height =
          `${(activeCount / journeySteps.length) * maxHeight}px`;
      }
    });
  }, { threshold: 0.42 });

  journeySteps.forEach(step => journeyObserver.observe(step));
}