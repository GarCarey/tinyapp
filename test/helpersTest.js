const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with a valid email', function() {
    const user = findUserByEmail('user@example.com', testUsers);
    const expectedOutput = "userRandomID";
    const userId = user.id;
    assert.strictEqual(userId, expectedOutput);
  });

  it('should return undefined with a non-existant email', function() {
    const user = findUserByEmail('gareth@example.com', testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});