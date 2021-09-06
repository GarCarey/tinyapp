function findUserByEmail(email, database) {
  for (const id in database) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

function generateRandomString() {
  let randomString = ""
  const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (let i = 0; i < 6; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomString;
};

function urlsForUser(id, database) {
  let newDB = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      newDB[shortURL] = {
        longURL: database[shortURL].longURL,
      };
    }
  }
  return newDB;
};

module.exports = { findUserByEmail, generateRandomString, urlsForUser };