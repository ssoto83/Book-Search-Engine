const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth'); // Import your auth middleware

const app = express();
const PORT = process.env.PORT || 3005;

// Create a new Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware, // Add the auth middleware to the context
});

// Function to start the Apollo server
const startApolloServer = async () => {
  await server.start();  // Make sure to await the start
  server.applyMiddleware({ app }); // Apply middleware

  // Middleware for parsing JSON and URL-encoded data
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // Use routes
  app.use(routes);

  // Start the database and server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Call the function to start the server
startApolloServer();
