var socket = io();

const selector = document.getElementById("selector");
const themeButton = document.getElementById("dark");
const returnButton = document.getElementById("return");
const reportEnter = document.getElementById("reportEnter");
const theme = document.getElementById("theme");
const reportButton = document.getElementById("reportButton");

// LES COOOOOOOOOOOOOKIES
let vc = localStorage.getItem("usr");
let vc2 = localStorage.getItem("theme");

if (vc == "rasax_null_usr_chocolate5145" || vc == null) {
  window.location.href = "/login";
}
if (vc2 == "dark") {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  theme.href = "css/report/dark.css";
  document.getElementById("dark").innerHTML =
    "<img src='img/soleil.png' width='24' height='24'>";
}


// Fonction a executer lors des changements dans le selecteur
selector.addEventListener("change", (event) => {
  let reportName = document.getElementById("reportName");
  let reportReason = document.getElementById("reportReason");
  if (event.target.value == 1) {
    reportName.placeholder = "Enter username to report";
    reportReason.placeholder = "Enter reason of report";
  } else if (event.target.value == 2) {
    reportName.placeholder = "Enter message to report";
    reportReason.placeholder = "Enter reason of report";
  } else if (event.target.value == 3) {
    reportName.placeholder = "Enter bug to report";
    reportReason.placeholder = "Enter step to reproduce";
  } else if (event.target.value == 4) {
    reportName.placeholder = "Enter reason of report";
    reportReason.placeholder = "Enter step to reproduce";
  }
});

// on recup et envoie tout
reportButton.addEventListener("click", (event) => {
  let reportName = document.getElementById("reportName");
  let reportReason = document.getElementById("reportReason");

  if (reportName.value == "" || reportReason.value == "") {
    alert("Please fill in all fields");
  } else {
    event.preventDefault();
  let reporting = [];
  reporting.push(selector.value);
  reporting.push(document.getElementById("reportName").value);
  reporting.push(document.getElementById("reportReason").value);
  console.log(reporting);
  }
})

// Fonction de retour
returnButton.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/global";
});

// Theme (surcomplique)
themeButton.addEventListener("click", (event) => {
  event.preventDefault();
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  console.log(document.body.classList);

  if (document.body.classList.contains("dark")) {
    themeButton.innerHTML = "<img src='img/soleil.png' width='24' height='24'>";
    theme.href = "css/report/dark.css";
    localStorage.setItem("theme", "dark");
  } else {
    themeButton.innerHTML = "<img src='img/lune.png' width='24' height='24'>";
    theme.href = "css/report/light.css";
    localStorage.setItem("theme", "light");
  }
});
