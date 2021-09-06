const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }, 
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.userID] }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
  if (!email ||!password) {
    return res.status(400).send("Email or Password cannot be blank");
  } else if (findUserByEmail(email)) {
    return res.status(400).send("Email is already registered. Please log in");
  } 

  const userID = generateRandomString();
  users[userID] = {
    iD: userID,
    email: email,
    password: hashedPassword
  };

  res.cookie("userID", userID);
  console.log(users);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body; 
  const user = findUserByEmail(email);
  const comparedPassword = bcrypt.compareSync(password, user.password);
  
  if (!user) {
    return res.status(403).send("Email has not been registered. Please register");
  } else if (!comparedPassword) {
    return res.status(403).send("Wrong password");
  }
  
  res.cookie("userID", user.iD)
  console.log(users);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.userID] }

  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID", users.iD);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const id = req.cookies.userID;

  if (id) {
    const urls = urlsForUser(id);
    const templateVars = { 
      urls: urls, 
      user: users[id] 
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("Please login or register to view URLs");
  }

});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.userID] };

  if (!templateVars.user) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.userID;
  const shortURL = generateRandomString(); 
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID};
  console.log(urlDatabase);
  res.redirect(`/urls/`);
});

app.get('/urls/:shortURL', (req, res) => {
  const id = req.cookies.userID
  const { shortURL } = req.params;

  if(urlDatabase[shortURL].userID !== id){
    return res.send("You do not have permission to view this URL")
  }

  if (id) {
    const longURL = urlsForUser(id);
    const templateVars = { 
      shortURL: shortURL, 
      longURL: longURL[shortURL].longURL,
      user: users[id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("Please login or register to view URLs");
  }

});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const ID = req.cookies.userID;
  const { shortURL } = req.params;

  if(urlDatabase[shortURL].userID !== ID){
    return res.send("You do not have permission to delete this URL")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.userID;
  const { shortURL } = req.params;
  const longURL = req.body.longURL

  if(urlDatabase[shortURL].userID !== userID){
    return res.send("You do not have permission to edit this URL")
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/`);
});

function generateRandomString() {
  let randomString = ""
  const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < 6; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomString;
};

function findUserByEmail(email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

function urlsForUser(id) {
  let newDB = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      newDB[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
      };
    }
  }
  return newDB;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});