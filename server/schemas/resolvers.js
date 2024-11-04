const { User } = require('../models'); // Import User model
const { signToken } = require('../utils/auth'); // Import signToken function

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findById(context.user._id).select('-__v -password');
        return userData;
      }
      throw new Error('Not logged in');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new Error('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookId, authors, description, title, image, link }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          {
            $addToSet: { savedBooks: { bookId, authors, description, title, image, link } },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error('You need to be logged in!');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          {
            $pull: { savedBooks: { bookId } },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
