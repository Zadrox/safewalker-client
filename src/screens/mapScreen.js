import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, TouchableNativeFeedback, StatusBar } from 'react-native';

import MapView from 'react-native-maps';
import { Container, Icon } from 'native-base';
import Geocoder from 'react-native-geocoder';
import RNGooglePlaces from 'react-native-google-places';

import SearchHeader from '../components/searchHeader';
import LocationSearchResults from '../components/LocationSearchResults';
import SearchResultsList from '../components/SearchResultsList';
import BezierCurve from '../utils/BezierCurve';

import Constants from '../constants'

import _ from 'lodash';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResultsOpen: false,
      showProgressBar: false,
      destinationText: '',
      destination: null,
      sourceText: '',
      source: null,
      focusedItem: '',
      autocompleteLocations: [],
      markers: [],
      timeoutId: 0,
      region: {
        latitude: 53.5238595,
        longitude: -113.5290916,
        latitudeDelta: 0.0222,
        longitudeDelta: 0.0121,
      }
    };

    this._onRegionChange = this._onRegionChange.bind(this);
    this._onReceiveUpdPosition = this._onReceiveUpdPosition.bind(this);
    this._onToggleDrawer = this._onToggleDrawer.bind(this);
    this._onUserSelectListItem = this._onUserSelectListItem.bind(this);
  }

  toggleSearchResults = () => {
    const {searchResultsOpen} = this.state;

    this.setState({
      searchResultsOpen: !searchResultsOpen,
      destinationText: ''
    });
  }

  componentWillMount() {
    const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

    this.setState({
      height: windowHeight,
      width: windowWidth,
    });
  }

  componentDidMount() {

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this._onReceiveUpdPosition(position);
      },
      (error) => console.log(error),
      {timeout: 10000, maximumAge: 1000}
    );

  }

  _retrieveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this._onReceiveUpdPosition(position);
      },
      (error) => console.log(error),
      {timeout: 10000, maximumAge: 1000}
    );
  }

  _onReceiveUpdPosition(location) {
    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    Geocoder.geocodePosition({lat, lng})
    .then(res => {

      const name = `${res[0].streetNumber} ${res[0].streetName}`;

      this.setState({
        sourceText: "Current Location",
        source: { name, address: res[0].formattedAddress, latitude: lat, longitude: lng },
      });
    })
    .catch(err => console.error(err));

    const latitudeDelta = this.state.region.latitudeDelta._value;
    const longitudeDelta = this.state.region.longitudeDelta._value;

    this.map.animateToCoordinate(location.coords, 1000);
  }

  _onLayout = () => {

    const {
      width: windowWidth,
      height: windowHeight,
    } = Dimensions.get('window');

    this.setState({
      height: windowHeight,
      width: windowWidth,
    }, () => console.log(this.state));
  }

  async _onUserSelectListItem(item) {
    const { focusedItem } = this.state;
    const { latitude, longitude } = await RNGooglePlaces.lookUpPlaceByID(item.placeID);

    const compiledLocation = {
      name: item.primaryText,
      address: item.secondaryText,
      latitude,
      longitude,
    };

    let compiledState = focusedItem === Constants.searchHeader.DESTINATION_INPUT ?
      { destinationText: item.primaryText, destination: compiledLocation } :
      { sourceText: item.primaryText, source: compiledLocation };

    this.setState(compiledState, this._onBothSrcDestSet);

    // TODO: dispatch action to create request if destination and source are set.

  }

  _onBothSrcDestSet = () => {
    this.setState({
      searchResultsOpen: false,
      markers: [this.state.source, this.state.destination],
      polyLineCoords: BezierCurve(this.state.source, this.state.destination)
    }, () => {
      // console.log(this.map);
      setTimeout(() => this.map.fitToElements(true), 250);
    });
  }

  _onToggleDrawer() {
    this.props.navigation.navigate('DrawerOpen');
  }

  _onTextInputFocus = (focusedItem) => {
    this.setState({focusedItem});
  }

  _onRegionChange(region) {
    this.setState({region});
  }

  _onNoInputTimeout = () => {
    const { focusedItem, destinationText, sourceText, region } = this.state;

    const searchText =
      focusedItem === Constants.searchHeader.DESTINATION_INPUT ?
      destinationText : sourceText;

    this.setState({showProgressBar: true});

    RNGooglePlaces.getAutocompletePredictions(searchText, {
      type: 'establishments',
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      radius: 0.5
    })
    .then((places) => {
      this.setState({
        autocompleteLocations: places,
        showProgressBar: false
      });
    })
    .catch(error => console.log(error.message));
  }

  _onDestinationTextChange = (text) => {
    const destinationText = text;

    clearTimeout(this.state.timeoutId);

    this.setState( {
      destinationText,
      timeoutId: setTimeout(this._onNoInputTimeout, 1000),
    } );
  }

  _onSourceTextChange = (text) => {
    const sourceText = text;

    this.setState( {
      sourceText,
      timeoutId: setTimeout(this._onNoInputTimeout, 1000),
    } );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(nextState, this.state)
      && _.isEqual(nextProps, this.props)) return false;
    return true;
  }

  render() {
    const {
      sourceText,
      destinationText,
      searchResultsOpen,
      width,
      height,
      autocompleteLocations,
      showProgressBar
    } = this.state;

    // console.log(autocompleteLocations);

    return (
      <Container
        onLayout={this._onLayout}
        style={styles.container}>
        <StatusBar
          translucent
          backgroundColor='rgba(100, 100, 100, 0.4)'
        />
        <View
          style={styles.navButtonContainer}>
          <TouchableNativeFeedback
            onPress={searchResultsOpen ? this.toggleSearchResults : this._onToggleDrawer}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
            <View
              style={styles.navButton}>
              <Icon
                style={{fontSize: 24}}
                name={searchResultsOpen ? "arrow-back" : "menu"}
              />
            </View>
          </TouchableNativeFeedback>
        </View>

        <SearchHeader
          width={width}
          onTextInputFocus={this._onTextInputFocus}
          expanded={searchResultsOpen}
          sourceText={sourceText}
          destinationText={destinationText}
          onDestinationTextChange={this._onDestinationTextChange}
          onSourceTextChange={this._onSourceTextChange}
          onPress={this.toggleSearchResults}/>

        <LocationSearchResults
          width={width}
          height={height}
          visible={searchResultsOpen}>
          <SearchResultsList
            list={autocompleteLocations}
            showProgressBar={showProgressBar}
            onUserSelectListItem={this._onUserSelectListItem} />
        </LocationSearchResults>

        <View
          style={[styles.locationButtonContainer, {opacity: searchResultsOpen ? 0 : 1}]}>
          <TouchableNativeFeedback
            onPress={this._retrieveLocation}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
            <View
              style={styles.locationButton}>
              <Icon style={{fontSize: 24, color: '#FFF'}} name="locate"/>
            </View>
          </TouchableNativeFeedback>
        </View>

        <MapView
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          pitchEnabled={false}
          style={styles.map}
          ref={map => this.map = map}
          initialRegion={this.state.region}
          onRegionChange={this._onRegionChange}>

          {this.state.markers.map(({name, address, latitude, longitude}, index) =>
            (<MapView.Marker
              key={index}
              coordinate={{latitude, longitude}}
              title={name}/>
            )
          )}

          {this.state.markers.length !== 0 && (
            <MapView.Polyline
              coordinates={this.state.polyLineCoords}
              lineCap="square"
              miterLimit={10}
              strokeWidth={2}
            />
          )}

        </MapView>

      </Container>
    );
  }
}

const styles = {
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
  locationButtonContainer: {
    position: 'absolute',
    borderRadius: 28,
    height: 56,
    width: 56,
    bottom: 20,
    right: 20,
    elevation: 8,
    backgroundColor: '#FFF',
  },
  locationButton: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50'
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
