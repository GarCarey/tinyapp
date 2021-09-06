function findUserByEmail(email, database) {
  for (const id in database) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { findUserByEmail };