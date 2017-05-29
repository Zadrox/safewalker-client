import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

// creates a subscription ready Apollo Client instance
export default function makeApolloClient() {
  const scapholdUrl = 'us-west-2.api.scaphold.io/graphql/safewalk-me';
  const graphqlUrl = `https://${scapholdUrl}`;
  const websocketUrl = `wss://${scapholdUrl}`;
  const networkInterface = createNetworkInterface({uri: graphqlUrl});

  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {};
      }
      // TODO: add user auth stuff...
      // For reader: why wasn't this added?
      // Note that this project was designed to be for multiple users across many universities.
      // Ideally, I'd be able to integrate with University OAUTH providers and use that.
      // I'd then toss the token into AsyncStorage, and use that with base64 decode to
      // obtain the user id instead of hard coding it. But for the purposes of the demo, there was no point.
      // as Auth wasn't going to be demonstrated anyway. 

      req.options.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTYzNDkwNTMsImlhdCI6MTQ5NTA1MzA1MywiYXVkIjoiODQ1ODAxYmYtMjYzYy00NzAyLWFmMGItYzllNDVmNTdlNDIyIiwiaXNzIjoiaHR0cHM6Ly9zY2FwaG9sZC5pbyIsInN1YiI6IjEifQ.GjEaZ88HLqIA_qYFluYL9KJglAnJxGWpgc7ZwqZEmwI`;
      next();
    },
  }]);

  const wsClient = new SubscriptionClient(websocketUrl, {reconnect: true});
  const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(networkInterface, wsClient);

  const clientGraphql = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions
  });
  return clientGraphql;
}
