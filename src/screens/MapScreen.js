import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, TouchableNativeFeedback, StatusBar, Text } from 'react-native';

import MapView from 'react-native-maps';
import { Container, Icon } from 'native-base';
import Geocoder from 'react-native-geocoder';
import RNGooglePlaces from 'react-native-google-places';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import SearchHeader from '../components/SearchHeader';
import LocationSearchResults from '../components/LocationSearchResults';
import SearchResultsList from '../components/SearchResultsList';
import NavButton from '../components/NavButton';
import PreviewRequest from '../components/PreviewRequest';
import BezierCurve from '../utils/BezierCurve';
import LocationMarker from '../components/LocationMarker';
import PersonMarker from '../components/PersonMarker';

import Constants from '../constants'

import _ from 'lodash';

class MapScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requestId: null,
      walkerId: null,
      walker: null,
      searchResultsOpen: false,
      showProgressBar: false,
      previewRequestOpen: false,
      destinationText: '',
      destination: null,
      sourceText: '',
      showsUserLocation: true,
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

  openSearchModal = () => {
    RNGooglePlaces.openPlacePickerModal()
    .then((place) => {
      const { name, address, latitude, longitude } = place;
      const { focusedItem } = this.state;

      const location = {
        name,
        address,
        latitude,
        longitude
      };

      let compiledState = focusedItem === Constants.searchHeader.DESTINATION_INPUT ?
        { destinationText: name, destination: location } :
        { sourceText: name, source: location };

      this.setState(compiledState, this._onBothSrcDestSet);
    })
    .catch(error => console.log(error.message));  // error is a Javascript Error object
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
        region: {
          ...location.coords,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
        }
      });
    })
    .catch(err => console.error(err));

    this.map.animateToCoordinate(location.coords, 1000);
  }

  setRequestId = (requestId) => {
    this.setState({requestId});
  }

  setWalkerId = (walkerId) => {
    this.setState({walkerId});
  }

  setWalker = (walker) => {
    if (this.state.walkerId)
    this.setState({walker});
  }

  _onLayout = () => {
    const {
      width: windowWidth,
      height: windowHeight,
    } = Dimensions.get('window');

    this.setState({
      height: windowHeight,
      width: windowWidth,
    });
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

    const { source, destination } = this.state;
    if (!source || !destination) return;

    this.setState({
      searchResultsOpen: false,
      previewRequestOpen: true,
      showsUserLocation: false,
      markers: [this.state.source, this.state.destination],
      polyLineCoords: BezierCurve(this.state.source, this.state.destination)
    }, () => {
      this.map.fitToCoordinates(
        this.state.polyLineCoords,
        {
          edgePadding: {
            top: 50,
            right: 25,
            bottom: 300,
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

  cancelPendingRequest = () => {
    this.setState({
      previewRequestOpen: false,
      destination: null,
      destinationText: "",
      markers: [],
      autocompleteLocations: [],
      polyLineCoords: null,
      showsUserLocation: true,
    });
  }

  cancelRequest = () => {
    this.setState({
      requestId: null,
      walkerId: null,
      previewRequestOpen: false,
      destination: null,
      destinationText: "",
      markers: [],
      autocompleteLocations: [],
      walker: null,
      polyLineCoords: null,
      showsUserLocation: true,
    });
  }

  _onTextInputFocus = (focusedItem) => {
    this.setState({focusedItem, autocompleteLocations: []});
  }

  _onRegionChange(region) {
    // this.setState({region});
  }

  _onNoInputTimeout = () => {
    const { focusedItem, destinationText, sourceText, region } = this.state;

    const searchText =
      focusedItem === Constants.searchHeader.DESTINATION_INPUT ?
      destinationText : sourceText;

    if (searchText.length === 0) {
      this.setState({
        showProgressBar: false,
        autocompleteLocations: [],
      });
      return;
    }

    RNGooglePlaces.getAutocompletePredictions(searchText, {
      type: 'establishments',
      latitude: region.latitude,
      longitude: region.longitude,
      radius: 0.5
    })
    .then((places) => {

      this.setState({
        autocompleteLocations: places,
        showProgressBar: false
      });
    })
    .catch(error => console.log(error));
  }

  _onDestinationTextChange = (text) => {
    const destinationText = text;

    clearTimeout(this.state.timeoutId);

    this.setState( {
      showProgressBar: true,
      destinationText,
      timeoutId: setTimeout(this._onNoInputTimeout, 300),
    } );
  }

  _onSourceTextChange = (text) => {
    const sourceText = text;

    clearTimeout(this.state.timeoutId);

    this.setState( {
      showProgressBar: true,
      sourceText,
      timeoutId: setTimeout(this._onNoInputTimeout, 300),
    } );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(nextState, this.state)
      && _.isEqual(nextProps, this.props)) return false;
    return true;
  }

  render() {
    // TODO: refactor search into its own component that manages its own state

    const {
      sourceText,
      source,
      destinationText,
      destination,
      searchResultsOpen,
      previewRequestOpen,
      showsUserLocation,
      requestId,
      walkerId,
      walker,
      width,
      height,
      focusedItem,
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
          cancelPendingRequest={this.cancelPendingRequest} />

        <SearchHeader
          width={width}
          expanded={searchResultsOpen}
          visible={!previewRequestOpen}
          sourceText={sourceText}
          destinationText={destinationText}
          onDestinationTextChange={this._onDestinationTextChange}
          onSourceTextChange={this._onSourceTextChange}
          onPress={this.toggleSearchResults}
          onTextInputFocus={this._onTextInputFocus}/>

        <LocationSearchResults
          width={width}
          height={height}
          visible={searchResultsOpen}>
          <SearchResultsList
            list={autocompleteLocations}
            showProgressBar={showProgressBar}
            focusedItem={focusedItem}
            onGetCurrentLocation={this._retrieveLocation}
            onUserSelectListItem={this._onUserSelectListItem}
            openSearchModal={this.openSearchModal} />
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
          pendingRequest={requestId ? true : false}
          cancelRequestState={this.cancelRequest}
          requestId={requestId}
          walkerId={walkerId}
          destination={destination}
          source={source}
          setRequestId={this.setRequestId}
          setWalkerId={this.setWalkerId}
          setWalker={this.setWalker}
          width={width}
          height={height}/>

        <MapView
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          showsCompass={false}
          pitchEnabled={false}
          showsPointsOfInterest={false}
          style={styles.map}
          ref={map => this.map = map}
          initialRegion={this.state.region}>

          {this.state.markers.map(({name, address, latitude, longitude}, index) =>
            (<MapView.Marker
              key={index}
              coordinate={{latitude, longitude}}>
              <LocationMarker title={name}/>
             </MapView.Marker>
            )
          )}

          {this.state.markers.length !== 0 && (
            <MapView.Polyline
              coordinates={this.state.polyLineCoords}
              lineCap="round"
              miterLimit={15}
              strokeWidth={1.5}
            />
          )}

          {walker && walkerId != 0 &&
            <MapView.Marker
              coordinate={{latitude: walker.latitude, longitude: walker.longitude}}
              centerOffset={{x: 0, y: 8}}>
              <PersonMarker/>
            </MapView.Marker>
            }

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

export default MapScreen;
