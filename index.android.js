/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { ApolloProvider } from 'react-apollo';
import makeApolloClient from './src/graphql/makeApolloClient';

import App from './src/app'

// console.log(makeApolloClient);

const client = makeApolloClient();

const WrappedApp = () => (
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>
);

AppRegistry.registerComponent('Safewalker', () => WrappedApp);
