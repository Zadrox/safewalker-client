import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableNativeFeedback } from 'react-native';

import { Icon } from 'native-base';

export default class SearchResultsRow extends Component {

  _onUserSelectListItem = () => {
    const {onUserSelectListItem} = this.props;

    onUserSelectListItem();
  }

  render() {
    const {title, subtitle} = this.props;

    return (
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.SelectableBackground()}
        onPress={this._onUserSelectListItem}>
        <View
          style={styles.textContainer}>
          <Text
            style={styles.title}
            pointerEvents={'none'}>
            {title}
          </Text>
          <Text
            style={styles.subtitle}
            pointerEvents={'none'}>
            {subtitle}
          </Text>
        </View>
      </TouchableNativeFeedback>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    minHeight: 56,
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
    height: 56,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    color: 'black',
  },
  subtitle: {
    fontSize: 11,
    color: '#A4A4AC',
  },
});
