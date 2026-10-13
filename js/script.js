/* =========================================================
   Student Portfolio - script.js
   1. Settings   2. Mobile menu   3. Projects from JSON
   4. GitHub repositories (REST API)   5. Contact form
   6. My own feature: light / dark theme switch
   ========================================================= */

/* ---------- 1. SETTINGS: change this to YOUR GitHub username ---------- */
const GITHUB_USERNAME = "jhayagwasii-arch";

/* ---------- 2. MOBILE MENU ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close the menu after tapping a link (phones)
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- 3. PROJECTS FROM JSON ---------- */
const projectsGrid = document.getElementById("projectsGrid");

// Placeholder shown until you add real screenshots to an images/ folder
const PLACEHOLDER_SHOT = "data:image/svg+xml," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 340'>" +
  "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
  "<stop offset='0' stop-color='#4f46e5'/><stop offset='1' stop-color='#818cf8'/></linearGradient></defs>" +
  "<rect width='600' height='340' fill='url(#g)'/>" +
  "<rect x='60' y='50' width='480' height='240' rx='14' fill='#fff' opacity='.92'/>" +
  "<rect x='60' y='50' width='480' height='34' rx='14' fill='#1e293b' opacity='.9'/>" +
  "<rect x='90' y='110' width='200' height='14' rx='7' fill='#cbd5e1'/>" +
  "<rect x='90' y='140' width='420' height='10' rx='5' fill='#e2e8f0'/>" +
  "<rect x='90' y='200' width='120' height='60' rx='8' fill='#4f46e5' opacity='.85'/>" +
  "<rect x='230' y='200' width='120' height='60' rx='8' fill='#f59e0b'/>" +
  "<rect x='370' y='200' width='120' height='60' rx='8' fill='#4f46e5' opacity='.5'/>" +
  "</svg>"
);

function showMessage(container, text, tag) {
  container.replaceChildren();
  const el = document.createElement(tag);
  el.className = "status-msg error";
  el.textContent = text;
  container.appendChild(el);
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "card project-card";

  const img = document.createElement("img");
  img.src = "images/" + project.screenshot;
  img.alt = "Screenshot of " + project.title;
  img.loading = "lazy";
  // If the screenshot file isn't in images/ yet, show a simple placeholder instead of a broken image
  img.onerror = () => {
    img.onerror = null;
    img.src = PLACEHOLDER_SHOT;
  };

  const body = document.createElement("div");
  body.className = "project-body";

  const title = document.createElement("h3");
  title.textContent = project.title;

  const desc = document.createElement("p");
  desc.textContent = project.description;

  const role = document.createElement("p");
  role.className = "project-role";
  const roleLabel = document.createElement("strong");
  roleLabel.textContent = "My role: ";
  role.append(roleLabel, project.role);

  const tags = document.createElement("ul");
  tags.className = "tag-list";
  project.technologies.forEach((tech) => {
    const li = document.createElement("li");
    li.textContent = tech;
    tags.appendChild(li);
  });

  const link = document.createElement("a");
  link.className = "btn btn-outline";
  link.href = project.link;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "View project";

  body.append(title, desc, role, tags, link);
  card.append(img, body);
  return card;
}

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    const projects = await response.json();
    projectsGrid.replaceChildren(...projects.map(createProjectCard));
  } catch (error) {
    console.warn("Could not load projects:", error.message);
    showMessage(projectsGrid, "Sorry, the projects could not be loaded right now. Please try again later.", "p");
  }
}

/* ---------- 4. LATEST GITHUB REPOSITORIES ---------- */
const repoList = document.getElementById("repoList");

async function loadRepos() {
  const url = "https://api.github.com/users/" + encodeURIComponent(GITHUB_USERNAME) +
              "/repos?sort=updated&per_page=5";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    const repos = await response.json();

    if (repos.length === 0) {
      const li = document.createElement("li");
      li.className = "status-msg";
      li.textContent = "No public repositories yet. Check back soon!";
      repoList.replaceChildren(li);
      return;
    }

    const items = repos.map((repo) => {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.href = repo.html_url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = repo.name;

      const lang = document.createElement("span");
      lang.className = "repo-lang";
      lang.textContent = repo.language || "No language detected";

      li.append(a, lang);
      return li;
    });
    repoList.replaceChildren(...items);
  } catch (error) {
    console.warn("Could not load GitHub data:", error.message);
    showMessage(repoList, "GitHub data is unavailable right now. Please try again later.", "li");
  }
}

/* ---------- 5. CONTACT FORM ---------- */
const form = document.getElementById("contactForm");
const successBox = document.getElementById("formSuccess");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  document.getElementById(fieldId + "Error").textContent = message;
  field.classList.toggle("invalid", message !== "");
  field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

function validateForm() {
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  let valid = true;

  setError("name", name === "" ? "Please enter your name." : "");
  if (name === "") valid = false;

  if (email === "") {
    setError("email", "Please enter your email.");
    valid = false;
  } else if (!emailPattern.test(email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  } else {
    setError("email", "");
  }

  setError("message", message === "" ? "Please write a message." : "");
  if (message === "") valid = false;

  return valid;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();               // a static site has no back end to receive the form
  successBox.hidden = true;

  if (!validateForm()) return;

  const firstName = form.name.value.trim().split(" ")[0];
  form.reset();                         // clear the form
  successBox.textContent = "Thank you, " + firstName + "! Your message has been received.";
  successBox.hidden = false;
});

// Clear an error as soon as the visitor starts fixing it
["name", "email", "message"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => setError(id, ""));
});

/* ---------- 6. MY OWN FEATURE: LIGHT / DARK THEME SWITCH ---------- */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
}

function getSavedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (e) {
    return null;                        // storage can be blocked; the site still works
  }
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(getSavedTheme() || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) { /* ignore */ }
});

/* ---------- START ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
loadProjects();
loadRepos();
