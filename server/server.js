const express = require('express');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const User = require('./models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs'); // Add bcrypt for password hashing

const PORT = process.env.PORT || 3006;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// Set up Apollo Server and Express middleware
const startApolloServer = async () => {
  await server.start();

  // Middleware to parse incoming requests
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // REST API endpoint for creating a user (POST /api/users)
  app.post('/api/users', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists!' });
      }

      // Hash the password before saving to the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await User.create({ email, password: hashedPassword });

      res.status(201).json(newUser);
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Apollo GraphQL middleware
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // Serve frontend assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Catch-all route for single-page application (SPA) support
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Start MongoDB connection and the server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
      console.log(`Use REST API for users at http://localhost:${PORT}/api/users`);
    });
  });
};

// Start the Apollo Server
startApolloServer();