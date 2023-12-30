const themeButton = document.getElementById("settings-button");  // DO
const sendButton = document.getElementById("send");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const form_a = document.getElementById("form");
const form_b = document.getElementById("settings");
const menubar = document.getElementById("menubar");
const returnButton = document.getElementById("return");         // DO
const report = document.getElementById("report");               // DO

const usr = localStorage.getItem("usr");
let vc2 = localStorage.getItem("theme");
if (vc2 == "dark") {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    theme.href = "css/global/dark.css";
    themeButton.innerHTML =
        "<img src='img/soleil.png' width='24' height='24'>";
}
if (usr == "rasax_null_usr_chocolate5145" || usr == "null") {
    window.location.href = "/login";
}

// on change le nom de la page
document.title = "Rasax - MP | " + localStorage.getItem("location");


// Fonction de theme
themeButton.addEventListener("click", (event) => {
  event.preventDefault();
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  console.log(document.body.classList);

  if (document.body.classList.contains("dark")) {
    // dark
    themeButton.innerHTML = "<img src='img/soleil.png' width='24' height='24'>";
    theme.href = "css/global/dark.css";
    localStorage.setItem("theme", "dark");
  } else {
    // light
    themeButton.innerHTML = "<img src='img/lune.png' width='24' height='24'>";
    theme.href = "css/global/light.css";
    localStorage.setItem("theme", "light");
  }
});

// Fonction de retour
returnButton.addEventListener("click", (event) => {
  event.preventDefault();
    window.location.href = "/global";
});

// Fonction de report
report.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "/report";
})