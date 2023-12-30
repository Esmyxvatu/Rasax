const socket = io({ auth: { serverOffset: 0 } });

socket.on("connect", () => {
  socket.recovered = true;
});

const form_a = document.getElementById("form"); // form du bas = form pour les msg + theme
const input = document.getElementById("input"); // input des messages
const messages = document.getElementById("messages"); // liste des messages
const form_b = document.getElementById("settings"); // form du haut = settings (report + return + exit)
const menubar = document.getElementById("menubar"); // menubar = menu deroulant des options des messages
const returnButton = document.getElementById("return"); // bouton retour
const report = document.getElementById("report"); // bouton report
const username = document.getElementById("username"); // input username
const password = document.getElementById("password"); // input password
const connect = document.getElementById("connect-button"); // bouton connect
const disconnect = document.getElementById("disconnect-button"); // bouton de deconnexion
const themeButton = document.getElementById("settings-button"); // bouton theme

let usr = localStorage.getItem("usr");
let theme = localStorage.getItem("theme");

// fonction d'envoi de message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Starting requests");
  if (input.value) {
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
    socket.emit("chat message", input.value, usr, clientOffset, "chat");
    input.value = "";
  }
});

// fonction de reception de messages
socket.on("new chat message", (msg, serverOffset) => {
  const item = document.createElement("li");
  let vc = usr;
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
        localStorage.setItem(
          "respond",
          "true|" +
            `<a href="#${serverOffset}" onclick="highlightMessage(event)"><img src="img/reponse.png" width="16" height="16" class="img"></a> `
        );
      }
    });
  });
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  socket.auth.serverOffset = serverOffset;
});

// fonction de theme
themeButton.addEventListener("click", (event) => {
  event.preventDefault();
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  console.log(document.body.classList);

  if (document.body.classList.contains("dark")) {
    // dark
    themeButton.innerText = "Light";
    theme.href = "css/global/dark.css";
    localStorage.setItem("theme", "dark");
  } else {
    // light
    themeButton.innerText = "Dark";
    theme.href = "css/global/light.css";
    localStorage.setItem("theme", "light");
  }
});
