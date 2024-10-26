const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Function to verify and decode the token
  authMiddleware: function ({ req }) {
    // Allows token to be sent via headers
    let token = req.headers.authorization || '';

    // ["Bearer", "<tokenvalue>"]
    if (token) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return { user: null }; // No token means no user
    }

    // Verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { user: data }; // Return user data
    } catch {
      console.log('Invalid token');
      return { user: null }; // Invalid token means no user
    }
  },

  // Function to sign a token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
