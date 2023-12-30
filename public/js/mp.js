const socket = io({
  auth: {
    serverOffset: 0,
  },
});

const rbutton = document.getElementById("return");
const themeButton = document.getElementById("dark");
const search_button = document.getElementById("search_button");
const search_input = document.getElementById("search");
const finded = document.getElementById("finded");

let vc = localStorage.getItem("usr");
let vc2 = localStorage.getItem("theme");


if (vc == "rasax_null_usr_chocolate5145" || vc == null) {
  window.location.href = "/login";
}
if (vc2 == "dark") {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  theme.href = "css/mp/dark.css";
  document.getElementById("dark").innerHTML =
    "<img src='img/soleil.png' width='24' height='24'>";
}


rbutton.addEventListener("click", () => {
  event.preventDefault();
  window.location.href = "/global";
});

themeButton.addEventListener("click", (event) => {
  event.preventDefault();
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  console.log(document.body.classList);

  if (document.body.classList.contains("dark")) {
    themeButton.innerHTML = "<img src='img/soleil.png' width='24' height='24'>";
    theme.href = "css/mp/dark.css";
    localStorage.setItem("theme", "dark");
  } else {
    themeButton.innerHTML = "<img src='img/lune.png' width='24' height='24'>";
    theme.href = "css/mp/light.css";
    localStorage.setItem("theme", "light");
  }
});

search_button.addEventListener("click", () => {
  event.preventDefault();
  socket.emit("mp_search", search_input.value);
});

socket.on("searchResults", (data) => {
  finded.innerHTML = "";
  console.log(data);

  if (data === "Return None, sorry") {
    const li = document.createElement("h1");
    li.textContent = data;
    li.style.textAlign = "center";
    finded.appendChild(li);
    return;
  } else {
    for (const username in data) {
      const button = document.createElement("button");
      button.textContent = data[username];
      finded.appendChild(button);

      button.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = "/discut";
      })
    }
  }
});
