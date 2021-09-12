// All requires
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

// global variables
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const saltRounds = 10;

// app.use and sets
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// DB that houses saved URLS
const urlDatabase = {};

// DB that houses registered users
const usersDatabase = {};

//   GET routes

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const id = req.session.userID
  const templateVars = { user: usersDatabase[id] }

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const { userID } = req.session;
  const user = usersDatabase[userID];
  const templateVars = { user };

  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const id = req.session.userID;

  if (id) {
    const urls = urlsForUser(id, urlDatabase);
    const templateVars = { 
      urls: urls, 
      user: usersDatabase[id] 
    };
    res.render("urls_index", templateVars);
  } else {
    return res.status(403).send("Please login or register to view URLs");
  }

});

app.get("/urls/new", (req, res) => {
  const { userID } = req.session;
  const user = usersDatabase[userID];
  const templateVars = { user };

  if (!templateVars.user) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.userID
  const shortURL = req.params.shortURL;

  if(!urlDatabase[shortURL]) {
    return res.status(404).send("URL does not exist, please check for correct URL");
  }

  if(urlDatabase[shortURL].userID !== id){
    return res.send("You do not have permission to view this URL")
  }

  if (id) {
    const longURL = urlsForUser(id, urlDatabase);
    const templateVars = { 
      shortURL: shortURL, 
      longURL: longURL[shortURL].longURL,
      user: usersDatabase[id]
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(403).send("Please login or register to view URLs");
  }

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]){
    return res.status(404).send("URL does not exist, please check for correct URL")
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL)
});

// POST routes

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
  if (!email ||!password) {
    return res.status(400).send("Email or Password cannot be blank");
  } else if (findUserByEmail(email, usersDatabase)) {
    return res.status(400).send("Email is already registered. Please log in");
  } 

  const userID = generateRandomString();
  usersDatabase[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };

  req.session.userID = userID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body; 
  const user = findUserByEmail(email, usersDatabase);
  let comparedPassword = true;

  if (!user) {
    return res.status(403).send("Email has not been registered. Please register");
  } else if (password.length) {
    comparedPassword = bcrypt.compareSync(password, user.password);
    if (!comparedPassword) {
      return res.status(403).send("Incorrect password");
    }
  } else if (!password.length) {
    return res.status(403).send("Incorrect password");
  }
  
  const userID = user.id;
  req.session.userID = userID;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  const shortURL = generateRandomString(); 
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const ID = req.session.userID;
  const { shortURL } = req.params;

  if(urlDatabase[shortURL].userID !== ID){
    return res.send("You do not have permission to delete this URL")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const { shortURL } = req.params;
  const longURL = req.body.longURL

  if(urlDatabase[shortURL].userID !== userID){
    return res.send("You do not have permission to edit this URL")
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});