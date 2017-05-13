/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Button } from 'native-base';

export default class PreviewRequest extends Component {
  render() {
    const {
      visible,
      width: windowWidth,
      height: windowHeight,
    } = this.props;

    const style = {
      top: visible ? 424 : windowHeight,
      height: windowHeight - 424,
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
          <Text>{"Services provided by the Student's Union of the University of Alberta"}</Text>
        </View>
        <View style={styles.separator} />
        <Button
          block
          info
          style={buttonStyle}>
          <Text>{"Request Safewalk"}</Text>
        </Button>
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
    borderRadius: 4,
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
