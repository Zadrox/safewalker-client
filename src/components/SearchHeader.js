import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

import Constants from '../constants';

import _ from 'lodash';

const transitionProps = {
  container: ['opacity'],
  hoverbar: ['top', 'left', 'height'],
  square: ['opacity'],
  destinationBox: ['opacity'],
  sourceBox: ['opacity'],
  destinationText: ['opacity'],
  verticalBar: ['opacity'],
  dot: ['opacity'],
}

const SQUARE_SIZE = 6;
const PADDING_SIDES = 6;

export default class SearchHeader extends Component {

  onSourceTextChange = (sourceText) => {
    const {onSourceTextChange} = this.props;

    this.setState({sourceText});
    onSourceTextChange(sourceText);
  }

  onDestinationTextChange = (destinationText) => {
    const {onDestinationTextChange} = this.props;

    onDestinationTextChange(destinationText);
  }

  onSourceTextFocus = () => {
    const {onTextInputFocus} = this.props;

    onTextInputFocus(Constants.searchHeader.SOURCE_INPUT);
  }

  onDestinationTextFocus = () => {
    const {onTextInputFocus} = this.props;

    onTextInputFocus(Constants.searchHeader.DESTINATION_INPUT);
  }

  onExpand = () => {
    const {onPress} = this.props;

    onPress();

    setTimeout(() => {
      if (!this.refs.destinationInput) return

      this.refs.destinationInput.focus();
    }, 350);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.expanded === this.props.expanded) return;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.expanded === this.props.expanded) return;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(this.props, nextProps)) return false;
    return true;
  }

  getAnimatableStyles = () => {
    const {visible, expanded, sourceText, destinationText, width} = this.props
    // const {width: windowWidth} = Dimensions.get('window')
    const paddedWidth = width - PADDING_SIDES*2;

    return {
      container: {
        height: expanded ? 136 : 90,
        opacity: visible ? 1 : 0,
        top: visible ? 0 : -136,
      },
      hoverbar: {
        top: expanded ? 0 : 36,
        left: expanded ? 0 : 6,
        height: expanded ? 124 : 48,
        width: expanded ? width : paddedWidth,
        backgroundColor: expanded ? '#4CAF50' : '#FFF',
        borderRadius: expanded ? 0 : 2,
      },
      square: {
        transform: expanded ? [{translateY: 52}] : [{translateY: 0}],
        opacity: expanded ? 1 : 0,
      },
      destinationBox: {
        left: expanded ? 94 : 56,
        top: expanded ? 72 + 12 : 28,
        width: expanded ? width - 86 - 32 : paddedWidth,
        height: expanded ? 32 : 48,
        opacity: expanded ? 1 : 0,
      },
      destinationText: {
        left: 56,
        top: 12,
        opacity: expanded ? 0 : 1,
      },
      sourceBox: {
        opacity: expanded ? 1 : 0,
      },
      verticalBar: {
        height: expanded ? 28 : 0,
        opacity: expanded ? 1 : 0,
      },
      dot: {
        opacity: expanded ? 1 : 0,
      },
    }
  }

  render() {
    const {expanded, sourceText, destinationText, showProgressBar, visible} = this.props;
    const animatableStyles = this.getAnimatableStyles();

    return (
      <Animatable.View
        style={[styles.container, animatableStyles.container]}
        transition={transitionProps.container}
        easing="linear"
        duration={250}
      >
        <Animatable.View
          style={[styles.hoverbar, animatableStyles.hoverbar]}
          transition={transitionProps.hoverbar}
          easing="linear"
          duration={250}
        >
          <TouchableOpacity
            style={styles.target}
            onPress={expanded ? null : this.onExpand}
          />
          <Animatable.View
            style={[styles.sourceBox, animatableStyles.sourceBox]}
            transition={transitionProps.sourceBox}
            pointerEvents={'box-none'}
            useNativeDriver
            easing="linear"
            duration={250}
          >
            {expanded && (
              <TextInput
                selectTextOnFocus
                ref={'sourceInput'}
                underlineColorAndroid={'transparent'}
                placeholder='Starting from?'
                disableFullscreenUI
                style={styles.input}
                value={sourceText}
                onChangeText={this.onSourceTextChange}
                onFocus={this.onSourceTextFocus}
              />
            )}
          </Animatable.View>
          <Animatable.Text
            style={[styles.destinationText, animatableStyles.destinationText]}
            transition={transitionProps.destinationText}
            pointerEvents={'none'}
            useNativeDriver
            easing="linear"
            duration={250}
          >
            {expanded ? '' : !expanded && destinationText.length === 0 ? 'Where to?' : destinationText}
          </Animatable.Text>
          <Animatable.View
            style={[styles.destinationBox, animatableStyles.destinationBox]}
            transition={transitionProps.destinationBox}
            pointerEvents={'box-none'}
            useNativeDriver
            easing="linear"
            duration={250}
          >
            {expanded && (
              <TextInput
                ref={'destinationInput'}
                underlineColorAndroid={'transparent'}
                placeholder='Where to?'
                disableFullscreenUI
                style={styles.input}
                value={destinationText}
                onChangeText={this.onDestinationTextChange}
                onFocus={this.onDestinationTextFocus}
              />
            )}
          </Animatable.View>
          <Animatable.View
            style={[styles.verticalBar, animatableStyles.verticalBar]}
            transition={transitionProps.verticalBar}
            pointerEvents={'none'}
            useNativeDriver
            easing="linear"
            duration={250}
          />
          <Animatable.View
            style={[styles.dot, animatableStyles.dot]}
            transition={transitionProps.dot}
            pointerEvents={'none'}
            useNativeDriver
            easing="linear"
            duration={250}
          />
          <Animatable.View
            style={[styles.square, animatableStyles.square]}
            transition={transitionProps.square}
            useNativeDriver
            easing="linear"
            duration={250}
          />
        </Animatable.View>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    // height: 136,
    width: '100%',
  },
  hoverbar: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    zIndex: 1,
    elevation: 4,
  },
  target: {
    flex: 1,
  },
  square: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    backgroundColor: 'black',
    top: 45,
    left: 59.5 + 8,
    zIndex: 2,
  },
  dot: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: SQUARE_SIZE / 2,
    backgroundColor: '#54545C',
    top: 45 + 12,
    left: 59.5 + 8,
    zIndex: 2,
  },
  destinationBox: {
    position: 'absolute',
    backgroundColor: '#F9F9F9',
    right: 24,
    left: 56,
    top: 28,
    borderRadius: 4,
    zIndex: 3,
  },
  destinationText: {
    position: 'absolute',
    zIndex: 4,
    color: '#525760',
    fontSize: 18,
    left: 56,
    top: 12,
    backgroundColor: 'transparent',
  },
  sourceBox: {
    position: 'absolute',
    backgroundColor: '#F9F9F9',
    borderRadius: 4,
    zIndex: 3,
    left: 86 + 8,
    right: 24,
    height: 32,
    top: 32 + 12,
  },
  verticalBar: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#54545C',
    zIndex: 2,
    height: 1,
    top: 54 + 12,
    left: 62 + 8,
  },
  input: {
    flex: 1,
    color: 'black',
    backgroundColor: 'transparent',
    zIndex: 10,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingBottom: 4,
    paddingTop: 4,
  },
});
