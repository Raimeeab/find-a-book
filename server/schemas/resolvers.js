const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    getUser: async (parent, { username, password }) => {
      const user = await User.findOne({ username });
      const correctPw = await user.isCorrectPassword(password);

      // If email or password is incorrect, throw the same error
      if (!user || !correctPw) {
        throw new AuthenticationError("Incorrect login credentials");
      }

      // When user is successfully logged in:
      const token = signToken(user);
      return { token, user };
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
      };

      // Allows for app to be used in social network context in the future
      let user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username already exists", {
          errors: {
            username: "This username is taken",
          },
        });
      };

      user = await User.create(userInput);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { username, password }) => {
        const user = await User.findOne({ username });
  
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
