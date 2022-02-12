const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Book {
    authors: String
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type User {
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query { 
     me: User
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  type Mutation {
    createUser(userInput: UserInput!): Auth
    login(username: String!, password: String!): Auth
  }
`;

module.exports = typeDefs; 