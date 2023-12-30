document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
});

let vc = localStorage.getItem("usr");
if (vc != "null") {
  window.location.href = "/global";
}

const socket = io({
  auth: {
    serverOffset: 0,
  },
  // enable retries
  ackTimeout: 10000,
  retries: 3,
});

let co = false;

document.getElementById("lbuttons").addEventListener("click", () => {
  event.preventDefault();
  console.log("Starting requests");

  const username_input = document.getElementById("username_input");
  const password_input = document.getElementById("password_input");
  const remember_me = document.getElementById("remember_me");

  const data = {
    username: username_input.value,
    password: password_input.value,
    remember_me: remember_me.checked,
  };

  console.log(data);

  socket.emit("login", data);

  if (co) {
    if (data.remember_me == true) {
      localStorage.setItem("usr", data.username);
    } else {
      localStorage.setItem("usr", data.username);
    }

    window.location.href = "/global";
  }
});

document.getElementById("cabuttons").addEventListener("click", () => {
  event.preventDefault();
  window.location.href = "createaccount";
});

socket.on("tologin", (data) => {
  co = true;
});
socket.on("tologinerror", (data) => {
  co = false;
  document.getElementById("error").classList.toggle("hidden");
  document.getElementById("error").innerText = data;
  setTimeout(function () {
    document.getElementById("error").classList.toggle("hidden");
  }, 2000);
});
