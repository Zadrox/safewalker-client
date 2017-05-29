import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Icon } from 'native-base';

class PersonMarker extends Component {
  render() {
    const { fontSize } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.bubble}>
          <Icon style={{fontSize: 16, color: '#ffffff'}} name="md-people"/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  bubble: {
    flex: 0,
    elevation: 2,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#fb8c00',
    padding: 2,
    borderRadius: 10,
    borderColor: '#ffbd45',
    borderWidth: 1,
  }
});

export default PersonMarker;
