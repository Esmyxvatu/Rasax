const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const fs = require("fs");
const { exit } = require("process");
const dt = require("date-and-time");

class logger {
  constructor() {
    this.log_file = `./log/output${dt.format(new Date(), "YYYY-MM-DD__HH-mm")}.log`;
  }

  info(process, message) {
    const date = dt.format(new Date(), "YYYY-MM-DD HH:mm:ss.SSS");
    var msg = `${date} [info]${process} | ${message}`;
    fs.appendFileSync(this.log_file, msg + "\n");
    console.info(msg);
  };

  warn(process, message) {
      const date = dt.format(new Date(), "YYYY-MM-DD HH:mm:ss.SSS");
      var msg = `${date} [warn]${process} | ${message}`;
      fs.appendFileSync(this.log_file, msg + "\n");
      console.warn(msg);
  };

  error(process, message) {
    const date = dt.format(new Date(), "YYYY-MM-DD HH:mm:ss.SSS");
    var msg = `${date} [error]${process} | ${message}`;
    fs.appendFileSync(this.log_file, msg + "\n");
    console.error(msg);
  };

  debug(process, message) {
    const date = dt.format(new Date(), "YYYY-MM-DD HH:mm:ss.SSS");
    var msg = `${date} [debug]${process} | ${message}`;
    fs.appendFileSync(this.log_file, msg + "\n");
    console.debug(msg);
  };

  fatal(process, message) {
    const date = dt.format(new Date(), "YYYY-MM-DD HH:mm:ss.SSS");
    var msg = `${date} [fatal]${process} | ${message}`;
    fs.appendFileSync(this.log_file, msg + "\n");
    console.fatal(msg);
  };
}
logger = new logger();



async function main() {
  // open the database file
  const db = await open({
    filename: "db/chat.db",
    driver: sqlite3.Database,
  });
  const udb = await open({
    filename: "db/iuser.db",
    driver: sqlite3.Database,
  });
  // create our 'messages' table (you can ignore the 'client_offset' column for now)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT,
        location TEXT
    );
  `);
  await udb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);

  

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
    // set up the adapter on each worker thread
  });

  app.use(express.static(join(__dirname, "public")));

  app.get("/global", (req, res) => { res.sendFile(join(__dirname, "public/html/index.html")); });
  app.get("/login", (req, res) => { res.sendFile(join(__dirname, "public/html/login.html")); });
  app.get("/createaccount", (req, res) => { res.sendFile(join(__dirname, "public/html/createaccount.html")); });
  app.get("/mp", (req, res) => { res.sendFile(join(__dirname, "public/html/mp.html")); });
  app.get("/test", (req, res) => { res.sendFile(join(__dirname, "public/html/test.html")); });
  app.get("/report", (req, res) => { res.sendFile(join(__dirname, "public/html/report.html")); });
  app.get("/discut", (req, res) => { res.sendFile(join(__dirname, "public/html/discut.html")); });

  app.use((req, res, next) => { res.status(404).sendFile(join(__dirname, "public/html/notfound.html")); });

  io.on("connection", async (socket) => {
    const clientIp = socket.handshake.address;

    socket.join("chat");

    socket.on("chat message", async (msg, username, clientOffset, location, callback) => {
      let result, tkt;

      let pro_username = await udb.get(
        "SELECT username FROM users WHERE username = ?",
        username
      );
      if (!pro_username) {
        socket.emit("chat message error", "Username not found");
        return;
      }

      msg = "<b>" + username + "</b> | " + msg;
      try {
        result = await db.run(
          "INSERT INTO messages (content, client_offset, location) VALUES (?, ?, ?)",
          msg,
          clientOffset,
          location
        );
      } catch (e) {
        if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
          // the message was already inserted, so we notify the client
          callback();
        } else {
          // nothing to do, just let the client retry
        }
        return;
      }
      io.to(location).emit("new chat message", msg, result.lastID);
      if (location === "chat") {
        tkt = "global";
      } else {
        tkt = location;
      }
      logger.info(tkt + " Chat", `New msg from ${clientIp} (msg : "${msg}")`);
      // acknowledge the event
      callback();
    });
    socket.on("login", async (data) => {
      const { username, password } = data;
      if (!username || !password) {
        logger.warn("Login", `Missing username or password for ip: ${clientIp}`);
        socket.emit("tologinerror", "Missing username or password");
        return;
      }
      if (username.length > 32) {
        logger.warn("Login", `Username too long for ip: ${clientIp}`);
        socket.emit("tologinerror", "Username too long");
        return;
      }
      if (password.length > 32) {
        logger.warn("Login", `Password too long for ip: ${clientIp}`);
        socket.emit("tologinerror", "Password too long");
        return;
      }
      const result = await udb.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password]
      );
      if (!result) {
        logger.warn("Login", `Username or password incorrect for ip: ${clientIp}`);
        socket.emit("tologinerror", "Username or password incorrect");
        return;
      } else {
        logger.info("Login", `Login success into ${username} for ip: ${clientIp}`);
        socket.emit("tologin", true);
      }
    });
    socket.on("createaccount", async (data) => {
      const { username, password, cpassword } = data;
      if (!username || !password) {
        logger.warn(
          "CreateAccount",
          `Missing username or password for ip: ${clientIp}`
        );
        socket.emit("tocreateaccounterror", "Missing username or password");
        return;
      }
      if (username.length > 32) {
        logger.warn("CreateAccount", `Username too long for ip: ${clientIp}`);
        socket.emit("tocreateaccounterror", "Username too long");
        return;
      }
      if (password.length > 32) {
        logger.warn("CreateAccount", `Password too long for ip: ${clientIp}`);
        socket.emit("tocreateaccounterror", "Password too long");
        return;
      }
      // si le username est deja dans la base de donné on indique que le username est deja utiliseisé
      const result = await udb.get("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      if (result) {
        logger.warn(
          "CreateAccount",
          `Username already exists for ip: ${clientIp}`
        );
        socket.emit("tocreateaccounterror", "Username already exists");
        return;
      }

      if (password !== cpassword) {
        logger.warn(
          "CreateAccount",
          `Passwords do not match for ip: ${clientIp}`
        );
        socket.emit("tocreateaccounterror", "Passwords do not match");
        return;
      } else {
        logger.info(
          "CreateAccount",
          `Creating account ${username} by ip: ${clientIp}`
        );
        await udb.run(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          username,
          password
        );
        socket.emit("tocreateaccount", true);
      }
    });
    socket.on("mp_search", async (data) => {
      // on dans la base de donnée les noms de tous les utilisateurs qui contient la chaine de caractères recherchee
      if (data === "") {
        socket.emit("searchResults", "Return None, sorry");
        return;
      }

      var result = await udb.all(
        `SELECT username FROM users WHERE username LIKE '%${data}%'`
      );

      if (result === null) {
        logger.warn("MP Search", `Search for ${data} return none`);
        result = "Return None, sorry";
      } else {
        logger.info(
          "MP Search",
          `Succesfuly find ${result.map(
            (row) => row.username
          )} from ${data} for ip: ${clientIp}`
        );
        result = result.map((row) => row.username);
      }

      socket.emit("searchResults", result);
    });

    socket.on("disconnect", () => {
      socket.leave("chat");
    });

    socket.on("report", async (data) => {
      const { reported, reportType, user, report } = data;
      if (!reported || !report) {
        logger.warn("Report", `Missing username or report for ip: ${clientIp}`);
        return;
      }

      logger.warn(
        "Report",
        `Reporting ${reported} (category : ${reportType}) by ${user} (reason : ${report})`
      );
      fs.appendFileSync(
        "./log/report.log",
        `${dt.format(
          new Date(),
          "YYYY-MM-DD__HH-mm"
        )} | ${reportType} > ${reported} reported by ${user} for ${report}\n`
      );
    });

    if (!socket.recovered) {
      try {
        await db.each(
          "SELECT id, content, location FROM messages WHERE id > ?",
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            io.to(row.location).emit("new chat message", row.content, row.id);
          }
        );
      } catch (e) {
        // something went wrong
        logger.error("Recover", `Error recovering socket: ${e}`);
      }
    }
  });

  // each worker will listen on a distinct port
  const port = 1378;
  let ip;
  const argument = process.argv[2];

  if (!argument || argument === "localhost") {
    ip = "localhost";
  } else {
    ip = argument;
  }

  server.listen(port, ip, () => {
    logger.debug(
      "Server",
      `Listening on port ${port} (full path: http://${ip}:${port})`
    );
  });
}

main();
