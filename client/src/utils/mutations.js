import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation createUser($userInput: UserInput!) {
    createUser(userInput: $userInput) {
      token
      user {
        _id
        email
        username
      }
    }
  }
`;