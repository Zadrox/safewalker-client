import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, TouchableNativeFeedback, StatusBar } from 'react-native';

import MapView from 'react-native-maps';
import { Container, Content, Icon, Button, Fab } from 'native-base';
import Geocoder from 'react-native-geocoder';

import SearchHeader from '../components/searchHeader';
import LocationSearchResults from '../components/LocationSearchResults';
import SearchResultsList from '../components/SearchResultsList';

import Constants from '../constants'

import _ from 'lodash';

const allLocations = [
  {id: 0, icon: 'home', title: 'Students\' Union Building', subtitle: '8900 114 St NW Edmonton, AB T6G 2S4'},
  {id: 1, icon: 'timer', title: 'General Services Building', subtitle: 'General Services Building, University Campus Northwest, Edmonton, AB T6G 2H1'},
  {id: 2, icon: 'timer', title: 'Lister Centre', subtitle: '11613 87 Ave NW, Edmonton, AB T6G 2H6'},
  {id: 3, icon: 'timer', title: 'Jubilee Auditorium', subtitle: '11455 87 Ave NW, Edmonton, AB T6G 2T2'},
  {id: 4, icon: 'timer', title: 'Health Sciences Jubilee Station', subtitle: '114 St NW, Edmonton, AB T6G 2V2'},
  {id: 5, icon: 'home', title: 'Walter C. Mackenzie Health Sciences Centre', subtitle: '8440 112 St NW, Edmonton, AB T6G 2B7'},
  {id: 7, icon: 'timer', title: 'Katz Group Centre', subtitle: '114 St NW and 87 Ave NW, Edmonton, AB T6G 2R7'},
  {id: 8, icon: 'timer', title: 'Timms Centre', subtitle: 'Timms Centre for the Arts, University of Alberta, 87 Avenue 112 St NW, Edmonton, AB T6G 2C9'},
  {id: 9, icon: 'timer', title: 'Law Centre', subtitle: '111 89 Ave NW, Edmonton, AB T6G 2H5'},
  {id: 10, icon: 'home', title: 'Fine Arts Building', subtitle: 'Fine Arts Building, University of Alberta, Edmonton, AB T6G 2C9'},
  {id: 11, icon: 'timer', title: 'University Transit Centre', subtitle: 'University Transit Center, 89 Ave NW, Edmonton, AB T6G 2C5'},
  {id: 12, icon: 'timer', title: 'HUB Mall', subtitle: 'HUB Mall, 112 St NW, Edmonton, AB, T6G 2C5'},
  {id: 13, icon: 'timer', title: 'Rutherford Library', subtitle: 'Rutherford Library, 90 Ave NW, Edmonton, AB T6G 2J4'},
  {id: 14, icon: 'timer', title: 'Humanities Centre ', subtitle: 'Humanities Centre, Saskatchewan Dr NW, Edmonton, AB T6G 2E5'},
  {id: 15, icon: 'home', title: 'Tory Lecture Hall', subtitle: 'Tory Lecture Hall, Saskatchewan Dr NW, Edmonton, AB T6G 2E1'},
  {id: 16, icon: 'timer', title: 'Alberta School of Business', subtitle: 'Alberta School of Business, Edmonton, AB T6G 2R6'},
  {id: 17, icon: 'timer', title: 'Convocation Hall', subtitle: 'Convocation Hall, Edmonton, AB T6G 2E6'},
  {id: 18, icon: 'timer', title: 'Dentistry/Pharmacy Centre', subtitle: 'Dentistry/Pharmacy Centre, Edmonton, AB T6G 2N8'},
  {id: 19, icon: 'timer', title: 'North Power Plant', subtitle: 'North Power Plant, Edmonton, AB T6G 2N2'},
  {id: 20, icon: 'timer', title: 'South Academic Building', subtitle: 'South Academic Building, Edmonton, AB T6G 2G7'},
  {id: 21, icon: 'timer', title: 'Cameron Library', subtitle: 'Cameron Library, Edmonton, AB T6G 2J8'},
  {id: 22, icon: 'timer', title: 'Earth Sciences Building', subtitle: 'Earth Sciences Building, Edmonton, AB T6G 2E3'},
  {id: 23, icon: 'timer', title: 'St. Joseph\'s College', subtitle: '11325 89 Ave NW, Edmonton, AB T6G 2J5'},
  {id: 24, icon: 'timer', title: 'Education Centre', subtitle: '11210 87 Ave NW, Edmonton, AB T6G 2T9'},
  {id: 25, icon: 'timer', title: 'Central Academic Building', subtitle: 'Central Academic Building, Edmonton, AB T6G 2E8'},
  {id: 26, icon: 'timer', title: 'Chemistry Building', subtitle: '11227 Saskatchewan Dr NW, Edmonton, AB T6G'},
  {id: 27, icon: 'timer', title: 'Centennial Centre for Interdisciplinary Science', subtitle: '11335 Saskatchewan Dr NW, Edmonton, AB T6G 2M9'},
  {id: 28, icon: 'timer', title: 'CCIS North Lecture Theatres', subtitle: 'CCIS North Lecture Theatres, Edmonton, AB T6G 2E9'},
  {id: 29, icon: 'timer', title: 'Biological Sciences Centre', subtitle: 'Biological Sciences Centre, Edmonton, AB T6G 2E9'},
  {id: 30, icon: 'timer', title: 'Assiniboia Hall', subtitle: 'Assiniboia Hall, Edmonton, AB T6G 2E7'},
  {id: 31, icon: 'timer', title: 'Athabasca Hall', subtitle: 'Athabasca Hall, Edmonton, AB T6G 2E8'},
  {id: 32, icon: 'timer', title: 'Pembina Hall', subtitle: 'Pembina Hall, Edmonton, AB T6G 2H8'},
  {id: 33, icon: 'timer', title: 'Agriculture Forestry Centre', subtitle: 'Agriculture Forestry Centre, Edmonton, AB T6G 2P5'},
  {id: 34, icon: 'timer', title: 'Natural Resources Engineering Facility', subtitle: '9105 116 St NW, Edmonton, AB T6G 2W2'},
  {id: 35, icon: 'timer', title: 'Morrison Structural Engineering Laboratory', subtitle: 'Morrison Structural Engineering Laboratory, Edmonton, AB T6G 2E9'},
  {id: 36, icon: 'timer', title: 'Computing Scence Centre', subtitle: 'Computing Science Centre, Edmonton, AB T6G 2E8'},
  {id: 37, icon: 'timer', title: 'Mechanical Engineering', subtitle: 'Mechanical Engineering, Edmonton, AB T6G 2G8'},
  {id: 38, icon: 'timer', title: 'Chemical Materials Engineering', subtitle: 'Chemical Materials Engineering, 116 St NW, Edmonton, AB T6G 2V4'},
  {id: 39, icon: 'timer', title: 'Engineering Teaching Learning Complex', subtitle: '9107 116 St NW, Edmonton, AB T6G 2V4'},
  {id: 40, icon: 'timer', title: 'National Institute for Nanotechnology', subtitle: '11421 Saskatchewan Dr NW, Edmonton, AB T6G 2M9'}
];

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResultsOpen: false,
      destinationText: '',
      sourceText: '',
      focusedItem: '',
      allLocations: allLocations,
      filteredLocations: [],
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
    .then(res => this.setState({sourceText: res[0].formattedAddress}))
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

  _onUserSelectListItem = (itemId) => {
    // console.log(itemId);
    const {focusedItem} = this.state;

    if (focusedItem === Constants.searchHeader.DESTINATION_INPUT) {
      this.setState({destinationText: this.state.allLocations[itemId].title});
    } else {
      this.setState({sourceText: this.state.allLocations[itemId].title});
    }

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

  _onDestinationTextChange = (text) => {
    const destinationText = text;
    //
    this.setState(
      { destinationText,
        filteredLocations: this.state.allLocations.filter((location) => {
          return location.title.includes(destinationText);
        }),
      }
    );
  }

  _onSourceTextChange = (text) => {
    const sourceText = text;

    this.setState(
      { sourceText,
        filteredLocations: this.state.allLocations.filter((location) => {
          return location.title.includes(sourceText);
        })
      }
    );
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
      filteredLocations,
      allLocations
    } = this.state;

    const locationList = filteredLocations.length ? filteredLocations : allLocations;

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
            list={locationList}
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
          style={styles.map}
          ref={map => this.map = map}
          initialRegion={this.state.region}
          onRegionChange={this._onRegionChange}/>

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
