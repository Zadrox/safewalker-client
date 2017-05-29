import React, { Component } from 'react';
import { ListView, View, Text, StyleSheet, ActivityIndicator, TouchableNativeFeedback, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Card, Content, Body, CardItem, Button, Icon, Container } from 'native-base';

import Constants from '../constants'
import SearchResultsRow from './SearchResultsRow'

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
    // const {title, subtitle, icon} = rowData;
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
              {focusedItem === Constants.searchHeader.SOURCE_INPUT && <View style={{padding: 0}}>
                <TouchableNativeFeedback
                  onPress={this.onGetCurrentLocation}
                  background={TouchableNativeFeedback.SelectableBackground()}>
                  <View
                    style={{flex: 1, height: 56, flexDirection: 'row', alignItems: 'center'}}>
                    <Icon style={{marginLeft: 16, marginRight: 16, fontSize: 24, color: '#2196F3'}} name="locate"/>
                    <Text>{"Use Current Location"}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>}
              {focusedItem === Constants.searchHeader.SOURCE_INPUT && <View style={styles.separator}/>}
              <View style={{padding: 0}}>
                <TouchableNativeFeedback
                  onPress={this.openSearchModal}
                  background={TouchableNativeFeedback.SelectableBackground()}>
                  <View
                    style={{flex: 1, height: 56, flexDirection: 'row', alignItems: 'center'}}>
                    <Icon style={{marginLeft: 19, marginRight: 19, fontSize: 24, color: '#9E9E9E'}} name="pin"/>
                    <Text>{"Pick a Nearby Location"}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
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
