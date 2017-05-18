/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Button } from 'native-base';

import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import _ from 'lodash';

class PreviewRequest extends Component {
  constructor(props) {
    super(props);

    this.requestSubscription = null;
  }

  _onSubmitRequestButtonPressed = () => {
    const { submitRequest, source, destination, requestorId = "VXNlcjox", setRequestId } = this.props;

    submitRequest({ source, destination, requestorId })
    .then( ({ data: { createRequest: { changedRequest: { id } } } }) => {
      setRequestId(id);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { subscribeToRequestUpdates, requestId, request } = nextProps;
    const { requestId: oldRequestId } = this.props;

    if (!this.requestSubscription && requestId && requestId !== oldRequestId) {
      console.log('here');
      this.requestSubscription = subscribeToRequestUpdates({requestId});
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(this.props, nextProps)) return false;

    return true;
  }

  _onCancelRequestButtonPressed = () => {
    const { cancelRequest, requestId, setRequestId } = this.props;

    this.requestSubscription && this.requestSubscription();

    this.requestSubscription = null;

    cancelRequest({id: requestId})
    .then(() => setRequestId(null));
  }

  componentWillUnmount() {
    this.requestSubscription && this.requestSubscription();

    this.requestSubscription = null;
  }

  render() {
    const {
      visible,
      pendingRequest,
      request,
      width: windowWidth,
      height: windowHeight,
    } = this.props;

    const containerHeader = 175;

    const style = {
      top: visible ? windowHeight - containerHeader : windowHeight,
      height: containerHeader,
      width: windowWidth - 32,
    }

    const buttonStyle = {
      margin: 16,
    }

    return (
      <Animatable.View
        style={[styles.container, style]}
        duration={250}
        easing="ease-out"
        transition={["top", "height", "width"]}>
        <View style={styles.content}>
          <Text>{"Services provided by:"}</Text>
          <Image
            style={{width: style.width - 32, height: style.height - 115}}
            resizeMode="contain"
            source={{uri: 'https://subprint.ca/images/website/su_logo_footer.png'}}/>
        </View>
        <View style={styles.separator} />
        {request && request.getRequest && <Text>{request.getRequest.status}</Text>}
        {pendingRequest && <Button
          block
          danger
          onPress={this._onCancelRequestButtonPressed}
          style={buttonStyle}>
          <Text>{"Cancel Pending Request"}</Text>
        </Button>}
        {!pendingRequest && <Button
          block
          info
          onPress={this._onSubmitRequestButtonPressed}
          style={buttonStyle}>
          <Text>{"Request Safewalk"}</Text>
        </Button>}
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    elevation: 8,
    marginLeft: 16,
    marginRight: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    zIndex: 1,
    position: 'absolute',
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    margin: 16,
  },
  separator: {
    height: 2,
    backgroundColor: '#EDEDED',
  }
});


const withCreateRequestMutation = graphql(
  gql`
    mutation($input: CreateRequestInput!) {
      createRequest(input: $input) {
        changedRequest {
          id
          status
          destination {
            name
            latitude
            longitude
          }
          source {
            name
            latitude
            longitude
          }
        }
      }
    }
  `,
  {
    props: ({ownProps, mutate}) => ({
      submitRequest: ({ source, destination, requestorId }) => {
        return mutate({
          variables: { input: { source, destination, requestorId }}
        });
      }
    }),
  }
);

const withCancelRequestMutation = graphql(
  gql`
    mutation($input: UpdateRequestInput!) {
      updateRequest(input: $input) {
        changedRequest {
          id
          status
        }
      }
    }
  `,
  {
    props: ({ownProps, mutate}) => ({
      cancelRequest: ({ id }) => {
        return mutate({
          variables: { input: { id, status: "CANCELLED"}}
        });
      }
    }),
  }
);

const REQUEST_SUBSCRIPTION = gql`
  subscription onRequestChanged($filter: RequestSubscriptionFilter, $mutations: [RequestMutationEvent]!) {
    subscribeToRequest(filter: $filter, mutations: $mutations) {
      value {
        status
        id
        assigned {
          id
          walker {
            id
            username
            latitude
            longitude
          }
        }
      }
    }
  }
`;

const withRequestData = graphql(
  gql`
    query($id: ID!) {
      getRequest(id: $id) {
        status
        id
        assigned {
          id
          walker {
            id
            username
            latitude
            longitude
          }
        }
      }
    }
  `,
  {
    name: 'request',
    skip: (ownProps) => ownProps.requestId ? false : true,
    options: (ownProps) => ({ variables: { id: ownProps.requestId }}),
    props: ({ownProps, request}) => {
      return {
        request,
        subscribeToRequestUpdates: ({requestId})=> {

          return request.subscribeToMore({
            document: REQUEST_SUBSCRIPTION,
            variables: {
              filter: { id: { eq: requestId }},
              mutations: ["updateRequest"]
            },
            updateQuery: (prev, {subscriptionData}) => {
              if (!subscriptionData.data) {
                return prev;
              }

              const nextState = Object.assign({}, {
                getRequest: subscriptionData.data.subscribeToRequest.value
              });

              return nextState;
            }
          });
        }
      };
    }
  }
);

export default compose(
  withCreateRequestMutation,
  withCancelRequestMutation,
  withRequestData,
)(PreviewRequest);
