import React, { Component } from 'react';
import { ListView, View, Text, StyleSheet, ActivityIndicator, TouchableNativeFeedback, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Card, Content, Body, CardItem, Button, Icon, Container } from 'native-base';

import Constants from '../constants';
import SearchResultsRow from './SearchResultsRow';
import TouchableCardRow from './TouchableCardRow';

const rowHasChanged = (r1, r2) => r1.placeID !== r2.placeID;

const ds = new ListView.DataSource({rowHasChanged});

export default class SearchResultsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: ds.cloneWithRows(this.props.list),
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: ds.cloneWithRows(nextProps.list)
    });
  }

  _onPressListItem = (rowData) => {
    const { onUserSelectListItem } = this.props;

    onUserSelectListItem(rowData);
  }

  onGetCurrentLocation = () => {
    const { onGetCurrentLocation } = this.props;

    onGetCurrentLocation();
  }

  renderSeparator = (sectionID, rowID) => {
    return (
      <View
        key={rowID}
        style={styles.separator}
      />
    );
  }

  renderRow = (rowData) => {
    const { primaryText, secondaryText } = rowData;

    return (
      <SearchResultsRow
        title={primaryText}
        subtitle={secondaryText}
        onUserSelectListItem={() => this._onPressListItem(rowData)}
      />
    );
  }

  openSearchModal = () => {
    const { openSearchModal } = this.props;

    openSearchModal();
  }

  render() {

    const { list, showProgressBar, focusedItem } = this.props;

    if (list.length === 0 && !showProgressBar) {
      return (
        <Container>
          <Content
            style={{marginLeft: 8, marginRight: 8, marginTop: 4}}
            keyboardShouldPersistTaps='handled'>
            <Card>
              {focusedItem === Constants.searchHeader.SOURCE_INPUT &&
              <TouchableCardRow
                text={"Use Current Location"}
                onPress={this.getCurrentLocation}
                color={"#2196F3"}
                icon={"locate"}/>}
              {focusedItem === Constants.searchHeader.SOURCE_INPUT && <View style={styles.separator}/>}
              <TouchableCardRow
                text={"Pick from Nearby Locations"}
                onPress={this.openSearchModal}
                color={"#BBBBBB"} 
                icon={"pin"}/>
            </Card>
          </Content>
        </Container>
      );
    } else if (this.props.showProgressBar) {
      return (
        <Container>
          <Content
            style={{marginLeft: 8, marginRight: 8, marginTop: 4}}>
            <Card
              style={{height: 56, alignContent: 'center', justifyContent: 'center'}}>
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                animating={this.props.showProgressBar}
              />
            </Card>
          </Content>
        </Container>
      );
    }

    return (
      <Container>
        <Content
          keyboardShouldPersistTaps='handled'
          style={{marginLeft: 8, marginRight: 8, marginTop: 4}}>
          <Card>
            <ListView
              keyboardShouldPersistTaps='handled'
              style={styles.container}
              dataSource={this.state.dataSource}
              renderRow={this.renderRow}
              renderSeparator={this.renderSeparator}
            />
          </Card>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'skyblue',
  },
  separator: {
    flex: 1,
    height: 2,
    backgroundColor: '#EDEDED',
  }
});
