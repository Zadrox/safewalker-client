import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableNativeFeedback } from 'react-native';

import { Icon } from 'native-base';

export default class SearchResultsRow extends Component {

  static defaultProps = {
    icon: 'pizza',
    title: 'Home',
    subtitle: 'Earth'
  }

  _onUserSelectListItem = () => {
    const {onUserSelectListItem} = this.props;

    onUserSelectListItem();
  }

  render() {
    const {icon, title, subtitle} = this.props;

    return (
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.SelectableBackground()}
        onPress={this._onUserSelectListItem}>
      <View
        style={styles.container}>
        <View
          style={styles.iconContainer}
          pointerEvents={'none'}>
          <Icon name={icon} />
        </View>
        <View
          style={styles.textContainer}
          pointerEvents={'none'}>
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
      </View>
      </TouchableNativeFeedback>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    height: 56,
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 25,
    justifyContent: 'center',
  },
  icon: {
    width: 15,
    height: 15,
  },
  textContainer: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    color: 'black',
  },
  subtitle: {
    fontSize: 13,
    color: '#A4A4AC',
  },
});
