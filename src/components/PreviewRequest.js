/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Button, Thumbnail } from 'native-base';

import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import _ from 'lodash';

class PreviewRequest extends Component {
  constructor(props) {
    super(props);

    this.requestSubscription = null;
    this.walkerSubscription = null;
  }

  _onSubmitRequestButtonPressed = () => {
    const { submitRequest, source, destination, requestorId = "VXNlcjox", setRequestId } = this.props;

    submitRequest({ source, destination, requestorId })
    .then( ({ data: { createRequest: { changedRequest: { id } } } }) => {
      setRequestId(id);
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      setWalkerId,
      setWalker,
      walker,
      subscribeToRequestUpdates,
      subscribeToWalkerLocation,
      request,
      requestId,
      walkerId
    } = nextProps;

    const {
      requestId: oldRequestId,
      walkerId: oldWalkerId,
      request: oldRequest,
      walker: oldWalker
    } = this.props;

    if (!this.requestSubscription && requestId && requestId !== oldRequestId) {
      this.requestSubscription = subscribeToRequestUpdates({requestId});
    }

    if (request &&
        request.getRequest &&
        request.getRequest.assignment &&
        request.getRequest.assignment.safewalker &&
        request.getRequest.assignment.safewalker.id !== oldWalkerId &&
        request.getRequest.status !== "COMPLETED") {
      setWalkerId(request.getRequest.assignment.safewalker.id);
      setWalker(request.getRequest.assignment.safewalker);
    }

    if (!this.walkerSubscription &&
        request &&
        !request.loading &&
        (request.getRequest.status == "ASSIGNED" || request.getRequest.status == "ARRIVED") &&
        walkerId &&
        walkerId !== oldWalkerId) {
      this.walkerSubscription = subscribeToWalkerLocation({walkerId});
    }

    if (this.walkerSubscription && walker && walker.getUser) {
      setWalker(walker.getUser);
    }

    if (this.walkerSubscription &&
        request &&
        !request.loading &&
        request.getRequest.status == "INPROGRESS") {
      this.walkerSubscription();
      this.walkerSubscription = null;
      setWalker(null);
      setWalkerId(null);
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(this.props, nextProps)) return false;

    return true;
  }

  _onCancelRequestButtonPressed = () => {
    const { cancelRequest, cancelRequestState, requestId, walkerId, setRequestId, setWalkerId } = this.props;

    this._cleanupSubscriptions();

    cancelRequest({id: requestId})
    .then(() => {
      cancelRequestState();
    });
  }

  _onCompleteRequestButtonPressed = () => {
    const { cancelRequestState } = this.props;

    this._cleanupSubscriptions();

    cancelRequestState();
  }

  _cleanupSubscriptions() {
    this.requestSubscription && this.requestSubscription();
    this.walkerSubscription && this.walkerSubscription();

    this.requestSubscription = null;
    this.walkerSubscription = null;
  }

  componentWillUnmount() {
    this._cleanupSubscriptions();
  }

  renderContent(style) {
    const { visible, pendingRequest, request, walker } = this.props;

    if (!request) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>{"Services provided by:"}</Text>
          <Image
            style={{width: style.width - 32, height: style.height - 115}}
            resizeMode="contain"
            source={{uri: 'https://subprint.ca/images/website/su_logo_footer.png'}}/>
        </View>
      );
    }
    if (request && request.loading) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>{"Searching for Safewalker"}</Text>
          <ActivityIndicator
            style={{marginTop: 12}}
            size="large"
            color="#4CAF50"
            animating
          />
        </View>
      );
    }
    switch(request.getRequest.status) {
      case "UNASSIGNED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>{"Searching for Safewalker"}</Text>
            <ActivityIndicator
              style={{marginTop: 12}}
              size="large"
              color="#4CAF50"
              animating
            />
          </View>
        );
      case "ASSIGNED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>
              <Text style={{fontWeight: 'bold'}}>{request.getRequest.assignment.safewalker.name}</Text> is on his way
            </Text>
          </View>
        );
      case "ARRIVED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>
              <Text style={{fontWeight: 'bold'}}>{request.getRequest.assignment.safewalker.name}</Text> has arrived
            </Text>
          </View>
        );
      case "INPROGRESS":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Transit in Progress</Text>
          </View>
        );
      case "COMPLETED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Journey Completed</Text>
          </View>
        );
      case "CANCELLED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Request Cancelled By Walker</Text>
          </View>
        );
      default:
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Error...</Text>
          </View>
        );
    }
  }

  renderIcon() {
    const { request } = this.props;

    if (!request || request.loading ) return (<View/>);

    if (request.getRequest.status == 'ASSIGNED' || request.getRequest.status == 'ARRIVED') {
      return (
        <View style={styles.thumbnailBorder}>
          <Thumbnail size={56} source={require('../../static/pooh.jpg')}/>
        </View>
      );
    }

    return (<View/>);
  }

  renderButton(buttonStyle) {
    const { request } = this.props;

    if (!request) {
      return (
        <Button
          block
          info
          onPress={this._onSubmitRequestButtonPressed}
          style={buttonStyle}>
          <Text>{"Request Safewalk"}</Text>
        </Button>
      );
    }
    if (request && request.loading) {
      return (
        <Button
          block
          danger
          onPress={this._onCancelRequestButtonPressed}
          style={buttonStyle}>
          <Text>{"Cancel Pending Request"}</Text>
        </Button>
      );
    }
    switch(request.getRequest.status) {
      case "UNASSIGNED":
        return (
          <Button
            block
            danger
            onPress={this._onCancelRequestButtonPressed}
            style={buttonStyle}>
            <Text>{"Cancel Pending Request"}</Text>
          </Button>
        );
      case "ASSIGNED":
        return (
          <Button
            block
            danger
            onPress={this._onCancelRequestButtonPressed}
            style={buttonStyle}>
            <Text>{"Cancel Pending Request"}</Text>
          </Button>
        );
      case "COMPLETED":
        return (
          <Button
            block
            success
            onPress={this._onCompleteRequestButtonPressed}
            style={buttonStyle}>
            <Text>{"Ok"}</Text>
          </Button>
        );
      case "CANCELLED":
        return (
          <Button
            block
            danger
            onPress={this._onCancelRequestButtonPressed}
            style={buttonStyle}>
            <Text>{"Ok"}</Text>
          </Button>
        );
      default:
        return (<View/>);
    }
  }

  render() {
    const {
      visible,
      pendingRequest,
      request,
      walker,
      width: windowWidth,
      height: windowHeight,
    } = this.props;

    const containerHeader = 175;

    const style = {
      top: visible ? windowHeight - containerHeader - 30 : windowHeight,
      height: containerHeader + 30,
      paddingTop: 30
    }

    const buttonStyle = {
      margin: 16,
    }

    return (
      <Animatable.View
        style={[styles.container, style]}
        duration={250}
        easing="ease-out"
        transition={["top"]}>
        {this.renderIcon()}
        <View key={2} style={[styles.innerContainer, {height: containerHeader, width: windowWidth - 32}]}>
          {this.renderContent({height: containerHeader, width: windowWidth - 32})}
          <View style={styles.separator} />
          {this.renderButton(buttonStyle)}
        </View>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    elevation: 8,
    marginLeft: 16,
    marginRight: 16,
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'white',
  },
  thumbnailBorder: {
    position: 'absolute',
    top: 0,
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 8,
    width: 60,
    height: 60,
    borderRadius: 30
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: '100%',
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
        const { latitude: srcLat, longitude: srcLng } = source;
        const { latitude: destLat, longitude: destLng } = destination;
        return mutate({
          variables: { input: {
            source,
            destination,
            requestorId,
            srcLat,
            srcLng,
            destLat,
            destLng
          }}
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
        assignment {
          id
          safewalker {
            id
            name
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
        assignment {
          id
          safewalker {
            id
            name
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

              return Object.assign({}, {
                getRequest: subscriptionData.data.subscribeToRequest.value
              });
            }
          });
        }
      };
    }
  }
);

const WALKER_SUBSCRIPTION = gql`
  subscription onWalkerChanged($filter: UserSubscriptionFilter, $mutations: [UserMutationEvent]!) {
    subscribeToUser(filter: $filter, mutations: $mutations) {
      value {
        id
        username
        latitude
        longitude
      }
    }
  }
`;

const withWalkerLocationData = graphql(
  gql`
    query walkerLocation($id: ID!) {
      getUser(id: $id) {
        id
        username
        latitude
        longitude
      }
    }
  `,
  {
    name: 'walker',
    skip: (ownProps) => ownProps.walkerId ? false : true,
    options: (ownProps) => ({ variables: { id: ownProps.walkerId }}),
    props: ({ownProps, walker}) => {
      return {
        walker,
        subscribeToWalkerLocation: ({walkerId}) => {
          return walker.subscribeToMore({
            document: WALKER_SUBSCRIPTION,
            variables: {
              filter: { id: { eq: walkerId }},
              mutations: ["updateUser"]
            },
            updateQuery: (prev, {subscriptionData}) => {
              if (!subscriptionData.data) {
                return prev;
              }

              const { longitude, latitude } = subscriptionData.data.subscribeToUser.value;
              const nextState = Object.assign({}, prev);

              nextState.getUser.longitude = longitude;
              nextState.getUser.latitude = latitude;

              console.log(nextState);

              return { getUser: subscriptionData.data.subscribeToUser.value };
            }
          })
        }
      }
    }
  }
)

export default compose(
  withCreateRequestMutation,
  withCancelRequestMutation,
  withRequestData,
  withWalkerLocationData,
)(PreviewRequest);
