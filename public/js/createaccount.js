document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
});

let co = false;

document.getElementById("cabuttons").addEventListener("click", () => {
  event.preventDefault();
  console.log("Starting requests");

  const username_input = document.getElementById("username_input");
  const password_input = document.getElementById("password_input");
  const password_second_input = document.getElementById(
    "password_second_input"
  );
  const remember_me = document.getElementById("remember_me");

  const data = {
    username: username_input.value,
    password: password_input.value,
    cpassword: password_second_input.value,
    remember_me: remember_me.checked,
  };

  console.log(data);

  const socket = io({
    auth: {
      serverOffset: 0,
    },
    // enable retries
    ackTimeout: 10000,
    retries: 3,
  });

  socket.emit("createaccount", data);
  socket.on("tocreateaccount", (data) => {
    co = true;
  });
  socket.on("tocreateaccounterror", (data) => {
    co = false;
    document.getElementById("error").classList.toggle("hidden");
    document.getElementById("error").innerText = data;
    setTimeout(function () {
      document.getElementById("error").classList.toggle("hidden");
    }, 2000);
  })

  if (co) {
    if (data.remember_me) {
      localStorage.setItem("usr", data.username);
    } else {
      localStorage.setItem("usr", data.username);
    }
    window.location.replace("/global");
  }
});

document.getElementById("lbuttons").addEventListener("click", () => {
  event.preventDefault();
  window.location.href = "/login";
});
