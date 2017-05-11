import React, { Component, PropTypes } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

import _ from 'lodash';

const transitionProps = ['top', 'height', 'width'];

export default class LocationSearchHeader extends Component {

  static defaultProps = {
    visible: false,
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(nextProps, this.props)) return false;
    return true;
  }

  render() {

    console.log('render');

    const {
      visible,
      onPress,
      children,
      width: windowWidth,
      height: windowHeight } = this.props;

    const style = {
      top: visible ? 124 : windowHeight,
      height: windowHeight - 124,
      width: windowWidth,
    }

    return (
      <Animatable.View
        style={[styles.container, style]}
        duration={250}
        easing={"ease-out"}
        transition={transitionProps}
      >
        {children}
      </Animatable.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    position: 'absolute',
    backgroundColor: 'white',
  },
})
