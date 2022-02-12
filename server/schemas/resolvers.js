const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      }
      // LAST PIECE OF THE PUZZLE
      throw new AuthenticationError("You need to be logged in!");
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }

      const correctPassword = await user.isCorrectPassword(password);
      if (!correctPassword) {
        throw new AuthenticationError("Invalid credentials");
      }
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const addBook = await User.findOneAndUpdate(
          {
            _id: context.user._id,
          },
          {
            $addToSet: { savedBooks: input },
          },
          {
            new: true,
            runValidators: true,
          }
        );
        return addBook;
      }
      console.log("checking token", context.user);
      throw new AuthenticationError("You must be logged in to save books.");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const deleteBook = await User.findOneAndUpdate(
          {
            _id: context.user._id,
          },
          {
            $pull: { savedBooks: { bookId: bookId } },
          },
          {
            new: true,
            runValidators: true,
          }
        );
        return deleteBook;
      }
      throw new AuthenticationError("You must be logged in to delete books.");
    },
  },
};

module.exports = resolvers;
