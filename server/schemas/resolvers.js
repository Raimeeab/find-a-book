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
    createUser: async (parent, { userInput }) => {
      let { username, email, password, confirmPassword } = userInput;

      // Use validators to ensure user input meets criteria
      const { valid, errors } = validateUserInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Validation errors", { errors });
      }

      // Allows for app to be used in social network context in the future
      let user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username already exists", {
          errors: {
            username: "This username is taken",
          },
        });
      }

      user = await User.create(userInput);
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
  },
};

module.exports = resolvers;
