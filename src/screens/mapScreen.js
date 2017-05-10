import React, { Component } from 'react';
import { StyleSheet, View, TouchableNativeFeedback, StatusBar } from 'react-native';

import MapView from 'react-native-maps';
import { Container, Icon, Header, Left } from 'native-base';

import SearchHeader from '../components/searchHeader';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResultsOpen: false,
      destinationText: '',
      sourceText: '',
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    };

    this._onRegionChange = this._onRegionChange.bind(this);
    this._onReceiveUpdPosition = this._onReceiveUpdPosition.bind(this);
    this._onToggleDrawer = this._onToggleDrawer.bind(this);
  }

  toggleSearchResults = () => {
    const {searchResultsOpen} = this.state

    this.setState({searchResultsOpen: !searchResultsOpen})
  }

  componentDidMount() {
    setInterval(
      () => navigator.geolocation.getCurrentPosition(
          this._onReceiveUpdPosition,
          console.info,
          {timeout: 20000, maximumAge: 1000}
        ),
      5000
    );

    setInterval(
      () => console.log(this.state), 10000
    );
  }

  _onReceiveUpdPosition(location) {
    const { latitude, longitude } = location.coords;
    const latitudeDelta = this.state.region.latitudeDelta._value;
    const longitudeDelta = this.state.region.longitudeDelta._value;

    this.map.animateToCoordinate(location.coords, 1000);
  }

  _onToggleDrawer() {
    this.props.navigation.navigate('DrawerOpen');
  }

  _onRegionChange(region) {
    this.setState({region});
  }

  _onDestinationTextChange = (text) => {
    const destinationText = text;
    //
    this.setState({destinationText});
  }

  _onSourceTextChange = (text) => {
    const sourceText = text;
    //
    this.setState({sourceText});
  }

  render() {
    const {sourceText, destinationText, searchResultsOpen} = this.state;

    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor='transparent'
        />
        <TouchableNativeFeedback
          onPress={searchResultsOpen ? this.toggleSearchResults : this._onToggleDrawer}
          background={TouchableNativeFeedback.SelectableBackground()}>
          <View
            style={styles.navButton}>
            <Icon
              style={{fontSize: 20}}
              name={searchResultsOpen ? "arrow-back" : "menu"}
            />
          </View>
        </TouchableNativeFeedback>

        <SearchHeader expanded={searchResultsOpen}
                      sourceText={sourceText}
                      destinationText={destinationText}
                      onDestinationTextChange={this._onDestinationTextChange}
                      onSourceTextChange={this._onSourceTextChange}
                      onPress={this.toggleSearchResults}/>

        <MapView showsUserLocation
                 showsMyLocationButton
                 style={styles.map}
                 ref={map => this.map = map}
                 initialRegion={this.state.region}
                 onRegionChange={this._onRegionChange}/>
      </View>
    );
  }
}

const styles = {
  navButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
    marginTop: 24,
    marginLeft: 6,
    width: 48,
    height: 48,
    backgroundColor: 'transparent'
  },
  container: {
    flex: 1,
    borderRadius: 0,
    backgroundColor: '#EEE',
  },
  map: {
    position: 'absolute',
    marginLeft: 1,
    zIndex: -1,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  }
};
