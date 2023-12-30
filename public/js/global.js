document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  localStorage.setItem("location", "chat");
})



let counter = 0;
let vc, vc2, vc3;

vc = localStorage.getItem("usr");
vc2 = localStorage.getItem("theme");

if (vc === "null") {
  window.location.href = "/login";
}
if (vc2 === "dark") {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  theme.href = "css/global/dark.css";
  document.getElementById("settings-button").innerHTML = "<img src='img/soleil.png' width='24' height='24'>";
}


const socket = io({
  auth: {
    serverOffset: 0,
  },
  // enable retries
  ackTimeout: 10000,
  retries: 3,
});

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const reportButton = document.getElementById("report");
const themeButton = document.getElementById("settings-button");
const li = document.querySelector("li");
const menubar = document.getElementById("menubar");
const selector = document.getElementById("menuDeroulant");


// Fonction d'envoi
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Starting requests");
  vc3 = localStorage.getItem("location");
  if (input.value && vc3) {
    const logic = localStorage.getItem("respond");
	if (logic) {
	    if (logic.startsWith("true")) {
	      let str1 = logic.split("|");
	      let str2 = str1[1];
	      input.value = str2 + " " + input.value;
	      localStorage.setItem("respond", "false");
	    }
	}

    // compute a unique offset
    const clientOffset = `${socket.id}-${counter++}`;
    socket.emit("chat message", input.value, vc, clientOffset, vc3);
    input.value = "";
  }
});


// Fonction de reception
socket.on("new chat message", (msg, serverOffset) => {
  const item = document.createElement("li");
  // on rajoute l'id correspondant a serverOffset
  item.id = serverOffset;

  if (msg.includes("@" + vc)) {
    let str1 = `@${vc}`;
    let str2 = `<span class="ping">@${vc}</span>`;
    msg = msg.replace(str1, str2);
  }  
  item.innerHTML = msg;

  // Ajouter l'écouteur d'événement de double-clic
  item.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    menubar.classList.toggle("hidden");
    selector.selectedIndex = 0;
    // deplacer le menu a coté de item
    menubar.style.position = "absolute";
    menubar.style.top = item.offsetTop + 10 + "px";
    menubar.style.left = event.clientX + 30 + "px";

    // Fonction de selection pour le menu deroulant
    selector.addEventListener("change", (event) => {
      let choose = selector.value;
      if (choose == 1) {
        window.alert("Coming soon !");
      } else if (choose == 2) {
        window.alert("Coming soon !");
      } else if (choose == 3) {
        // on copie le message dans le presse-papiers
        navigator.clipboard.writeText(item.innerText);
      } else if (choose == 4) {
        localStorage.setItem("respond", "true|" + `<a href="#${serverOffset}" onclick="highlightMessage(event)"><img src="img/reponse.png" width="16" height="16" class="img"></a> `);
      }});
  });

  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  socket.auth.serverOffset = serverOffset;
});

socket.on("chat message error", (msg) => { 
  window.alert(msg);
});


// Fonction de theme
themeButton.addEventListener("click", (event) => {
  event.preventDefault();
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  console.log(document.body.classList);

  if (document.body.classList.contains("dark")) {                          // dark
    themeButton.innerHTML = "<img src='img/soleil.png' width='24' height='24'>";
    theme.href = "css/global/dark.css";
    localStorage.setItem("theme", "dark");
  } else {                                                                // light
    themeButton.innerHTML = "<img src='img/lune.png' width='24' height='24'>";
    theme.href = "css/global/light.css";
    localStorage.setItem("theme", "light");
  }
});

// MP pour aller
document.getElementById("mp").addEventListener("click", () => {
  event.preventDefault();
  window.location.href = "/mp";
});

// Fonction de deconnexion
document.getElementById("disconnect-button").addEventListener("click", () => {
  event.preventDefault();
  socket.disconnect();
  localStorage.setItem("usr", "null");
  window.location.href = "/login";
});

// Fonction de report
reportButton.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/report";
});

// Cacher le menu deroulant si on clique en dehors (menu deroulant des messages)
document.addEventListener("click", function (event) {
  const target = event.target;
  if (!menuDeroulant.contains(target) && !menubar.contains(target)) {
    menubar.classList.add("hidden");
  }
});

// Fonction pour highlight les msgs
function highlightMessage(event) {
  var targetId = event.target.parentNode.getAttribute("href").substring(1); // Récupère l'ID de l'élément cible
  var targetElement = document.getElementById(targetId); // Trouve l'élément cible
  if (targetElement) {
    targetElement.classList.add("highlight"); // Ajoute la classe CSS 'highlight' à l'élément cible
    setTimeout(function () {
      targetElement.classList.remove("highlight"); // Supprime la classe CSS 'highlight' à l'élément cible
    }, 2000);
  }
}