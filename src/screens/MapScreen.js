import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, TouchableNativeFeedback, StatusBar } from 'react-native';

import MapView from 'react-native-maps';
import { Container, Icon } from 'native-base';
import Geocoder from 'react-native-geocoder';
import RNGooglePlaces from 'react-native-google-places';

import SearchHeader from '../components/SearchHeader';
import LocationSearchResults from '../components/LocationSearchResults';
import SearchResultsList from '../components/SearchResultsList';
import NavButton from '../components/NavButton';
import PreviewRequest from '../components/PreviewRequest';
import BezierCurve from '../utils/BezierCurve';

import Constants from '../constants'

import _ from 'lodash';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResultsOpen: false,
      showProgressBar: false,
      previewRequestOpen: false,
      destinationText: '',
      destination: null,
      sourceText: '',
      source: null,
      focusedItem: '',
      polyLineCoords: null,
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
  }

  _onBothSrcDestSet = () => {
    this.setState({
      searchResultsOpen: false,
      previewRequestOpen: true,
      markers: [this.state.source, this.state.destination],
      polyLineCoords: BezierCurve(this.state.source, this.state.destination)
    }, () => {
      this.map.fitToCoordinates(
        this.state.polyLineCoords,
        {
          edgePadding: {
            top: 150,
            right: 25,
            bottom: 350,
            left: 25,
          },
        animated: true
        }
      );
    });
  }

  toggleDrawer = () => {
    this.props.navigation.navigate('DrawerOpen');
  }

  cancelRequest = () => {
    // TODO: need to reest state.

    this.setState({
      previewRequestOpen: false,
      destination: null,
      destinationText: "",
      markers: [],
      autocompleteLocations: [],
      polyLineCoords: null,
    });
  }

  submitRequest = () => {
    // TODO: dispatch action to say I want somebody to come!
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
      timeoutId: setTimeout(this._onNoInputTimeout, 750),
    } );
  }

  _onSourceTextChange = (text) => {
    const sourceText = text;

    this.setState( {
      sourceText,
      timeoutId: setTimeout(this._onNoInputTimeout, 750),
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
      previewRequestOpen,
      width,
      height,
      autocompleteLocations,
      showProgressBar
    } = this.state;

    return (
      <Container
        onLayout={this._onLayout}
        style={styles.container}>
        <StatusBar
          translucent
          backgroundColor='rgba(100, 100, 100, 0.4)'
        />
        <NavButton
          searchResultsOpen={searchResultsOpen}
          previewRequestOpen={previewRequestOpen}
          toggleSearchResults={this.toggleSearchResults}
          toggleDrawer={this.toggleDrawer}
          cancelRequest={this.cancelRequest} />

        <SearchHeader
          width={width}
          onTextInputFocus={this._onTextInputFocus}
          expanded={searchResultsOpen}
          visible={!previewRequestOpen}
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
          style={[styles.locationButtonContainer, {opacity: searchResultsOpen || previewRequestOpen ? 0 : 1}]}>
          <TouchableNativeFeedback
            onPress={this._retrieveLocation}
            background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
            <View
              style={styles.locationButton}>
              <Icon style={{fontSize: 24, color: '#FFF'}} name="locate"/>
            </View>
          </TouchableNativeFeedback>
        </View>

        <PreviewRequest
          visible={previewRequestOpen}
          width={width}
          height={height}/>

        <MapView
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          pitchEnabled={false}
          showsPointsOfInterest={false}
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
