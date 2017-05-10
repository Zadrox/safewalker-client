import React, { Component, PropTypes } from 'react'
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native'
import * as Animatable from 'react-native-animatable'

const transitionProps = {
  hoverbar: ['top', 'left', 'height', 'width', 'shadowRadius', 'borderRadius', 'backgroundColor'],
  square: ['top', 'opacity'],
  destinationBox: ['left', 'top', 'height', 'opacity', 'width'],
  sourceBox: ['opacity'],
  destinationText: ['top', 'left', 'fontSize', 'color', 'opacity'],
  sourceText: ['opacity'],
  verticalBar: ['height', 'opacity'],
  dot: ['opacity'],
}

const SQUARE_SIZE = 6;

const Animatable.TextInput = Animatable.createAnimatableComponent(TextInput);

export default class SearchHeader extends Component {

  static defaultProps = {
    expanded: false,
    onPress: () => {},
    onSourceTextChange: () => {},
    onDestinationTextChange: () => {},
    sourceText: '',
    destinationText: '',
  }

  onSourceTextChange = (sourceText) => {
    const {onSourceTextChange} = this.props

    this.setState({sourceText})
    onSourceTextChange(sourceText)
  }

  onDestinationTextChange = (destinationText) => {
    const {onDestinationTextChange} = this.props

    onDestinationTextChange(destinationText)
  }

  onExpand = () => {
    const {onPress} = this.props

    onPress()

    setTimeout(() => {
      if (!this.refs.destinationInput) return

      this.refs.destinationInput.focus()
    }, 350)
  }

  getAnimatableStyles = () => {
    const {expanded, sourceText, destinationText} = this.props
    const {width: windowWidth} = Dimensions.get('window')
    const width = windowWidth - 12

    return {
      hoverbar: {
        top: expanded ? 0 : 28,
        left: expanded ? 0 : 6,
        height: expanded ? 150 : 40,
        width: expanded ? windowWidth : width,
        backgroundColor: expanded ? '#4CAF50' : '#FFF',
        borderRadius: expanded ? 0 : 2,
        shadowRadius: expanded ? 10 / 2 : 60 / 2,
      },
      square: {
        top: expanded ? 109 - 24 : 69 - 24,
        left: 30 + 29,
        opacity: expanded ? 1 : 0,
      },
      destinationBox: {
        left: expanded ? 30 + 56 : 6,
        right: 24,
        top: expanded ? 96 - 24 : 28,
        width: expanded ? windowWidth - 86 - 24 : width,
        height: expanded ? 32 : 40,
        opacity: expanded ? 1 : 0,
      },
      destinationText: {
        left: expanded ? 30 + 65 : 48,
        top: expanded ? 102 - 24 : 10,
        fontSize: expanded ? 16 : 16,
        color: expanded ? '#A4A4AC' : '#525760',
        opacity: (expanded && destinationText.length !== 0) ? 0 : 1,
      },
      sourceBox: {
        left: 30 + 56,
        right: 24,
        height: 32,
        top: 56 - 24,
        opacity: expanded ? 1 : 0,
      },
      sourceText: {
        left: 30 + 65,
        top: 64 - 24,
        fontSize: 16,
        color: '#A4A4AC',
        opacity: (!expanded || (expanded && sourceText.length !== 0)) ? 0 : 1,
      },
      verticalBar: {
        top: 78 - 24,
        left: 30 + 32,
        height: expanded ? 28 : 0,
        opacity: expanded ? 1 : 0,
      },
      dot: {
        top: 69 - 24,
        left: 30 + 29.5,
        opacity: expanded ? 1 : 0,
      },
    }
  }

  render() {
    const {expanded, sourceText, destinationText} = this.props;
    const animatableStyles = this.getAnimatableStyles();

    return (
      <View style={styles.container}>
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
            style={[styles.square, animatableStyles.square]}
            transition={transitionProps.square}
            easing="linear"
            duration={250}

          />
          <Animatable.Text
            style={[styles.sourceText, animatableStyles.sourceText]}
            transition={transitionProps.sourceText}
            pointerEvents={'none'}
            easing="linear"
            duration={250}

          >
            {sourceText.length === 0 ? 'Starting from?' : ''}
          </Animatable.Text>
          <Animatable.View
            style={[styles.destinationBox, animatableStyles.destinationBox]}
            transition={transitionProps.destinationBox}
            pointerEvents={'box-none'}
            easing="linear"
            duration={250}

          >
            {expanded && (
              <TextInput
                ref={'destinationInput'}
                underlineColorAndroid={'transparent'}
                style={styles.input}
                value={destinationText}
                onChangeText={this.onDestinationTextChange}
              />
            )}
          </Animatable.View>
          <Animatable.View
            style={[styles.sourceBox, animatableStyles.sourceBox]}
            transition={transitionProps.sourceBox}
            pointerEvents={'box-none'}
            easing="linear"
            duration={250}

          >
            {expanded && (
              <TextInput
                ref={'sourceInput'}
                underlineColorAndroid={'transparent'}
                style={styles.input}
                value={sourceText}
                onChangeText={this.onSourceTextChange}
              />
            )}
          </Animatable.View>
          <Animatable.View
            style={[styles.verticalBar, animatableStyles.verticalBar]}
            transition={transitionProps.verticalBar}
            pointerEvents={'none'}
            easing="linear"
            duration={250}

          />
          <Animatable.View
            style={[styles.dot, animatableStyles.dot]}
            transition={transitionProps.dot}
            pointerEvents={'none'}
            easing="linear"
            duration={250}

          />
          <Animatable.Text
            style={[styles.destinationText, animatableStyles.destinationText]}
            transition={transitionProps.destinationText}
            pointerEvents={'none'}
            easing="linear"
            duration={250}

          >
            {destinationText.length === 0 ? 'Where to?' : destinationText}
          </Animatable.Text>
        </Animatable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    width: '100%',
    height: 180,
  },
  hoverbar: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    zIndex: 1,
    elevation: 2,
  },
  target: {
    flex: 1,
  },
  square: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    backgroundColor: 'black',
    zIndex: 2,
  },
  dot: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: SQUARE_SIZE / 2,
    backgroundColor: '#54545C',
    zIndex: 2,
  },
  destinationBox: {
    position: 'absolute',
    backgroundColor: '#EDEDED',
    borderRadius: 4,
    zIndex: 3,
  },
  destinationText: {
    position: 'absolute',
    zIndex: 4,
    backgroundColor: 'transparent',
  },
  sourceText: {
    position: 'absolute',
    zIndex: 4,
    color: '#525760',
    opacity: 0,
    backgroundColor: 'transparent',
  },
  sourceBox: {
    position: 'absolute',
    backgroundColor: '#F9F9F9',
    borderRadius: 4,
    zIndex: 3,
  },
  verticalBar: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#54545C',
    zIndex: 2,
  },
  input: {
    flex: 1,
    color: 'black',
    backgroundColor: 'transparent',
    zIndex: 10,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
})
