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

export default class PreviewRequest extends Component {
  render() {
    const {
      visible,
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
