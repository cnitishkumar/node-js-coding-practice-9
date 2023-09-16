const express = require("express");
const path = require("path");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const app = express();

app.use(express.json());

const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initilizeDbAndServer();

/// API 1 create user

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;

    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const newUserDetails = await db.run(createUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// authenticate

const authenticate = (request, response, next) => {
  let jwt;
};

// login Api -3 post
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const isUserPresetQuery = `SELECT * FROM user WHERE
    username = '${username}';`;

  const dbUser = await db.get(isUserPresetQuery);
  if (dbUser !== undefined) {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    console.log(isPasswordMatched === true);
    if (isPasswordMatched) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    // not exists
    response.status(400);
    response.send("Invalid user");
  }
});

// API 3
// update password

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const getUserQuery = `SELECT * FROM user
  WHERE 
  username = '${username}';`;
  const dbUser = await db.get(getUserQuery);
  if (dbUser !== undefined) {
    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      dbUser.password
    );

    if (isPasswordMatched === true) {
      // password matched
      if (newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        // password more than 5 chars
        const updatedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `UPDATE user 
        SET
        password ='${updatedPassword}'
        WHERE
        username = '${username}';`;

        const dbResponse = await db.run(updatePasswordQuery);
        response.status(200);
        response.send("Password updated");
      }
    } else {
      //not matched password
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
