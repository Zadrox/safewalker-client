/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableNativeFeedback,
} from 'react-native';
import { Icon } from 'native-base';

export default class NavButton extends Component {

  _onPressNavButton = () => {
    const {
      searchResultsOpen,
      toggleSearchResults,
      previewRequestOpen,
      cancelPendingRequest,
      toggleDrawer
    } = this.props;

    if (previewRequestOpen) {
      cancelPendingRequest();
    } else if (searchResultsOpen){
      toggleSearchResults();
    } else {
      toggleDrawer();
    }
  }

  render() {
    const { searchResultsOpen, previewRequestOpen } = this.props;

    return (
      <View
        style={styles.navButtonContainer}>
        <TouchableNativeFeedback
          onPress={this._onPressNavButton}
          background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
          <View
            style={styles.navButton}>
            <Icon
              style={{fontSize: 24}}
              name={searchResultsOpen || previewRequestOpen ? "arrow-back" : "menu"}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  navButtonContainer: {
    position: 'absolute',
    zIndex: 6,
    marginTop: 32,
    marginLeft: 6,
    borderRadius: 28,
    width: 56,
    height: 56,
    backgroundColor: 'transparent',
  },
  navButton: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
