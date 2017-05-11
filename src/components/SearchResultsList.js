import React, { Component } from 'react'
import { ListView, View, Text, StyleSheet } from 'react-native'

import SearchResultsRow from './SearchResultsRow'

// Row comparison function
const rowHasChanged = (r1, r2) => r1.id !== r2.id

// DataSource template object
const ds = new ListView.DataSource({rowHasChanged})

export default class SearchResultsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: ds.cloneWithRows(this.props.list),
    }
  }

  componentWillReceiveProps(nextProps) {
    // if (this.props.list.length === 0 && nextProps.list.length === 0) return;
    this.setState({
      dataSource: ds.cloneWithRows(nextProps.list)
    });
  }

  _onPressListItem = (event) => {
    const { onUserSelectListItem } = this.props;

    onUserSelectListItem(event.id);
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
    const {title, subtitle, icon} = rowData;

    return (
      <SearchResultsRow
        title={title}
        subtitle={subtitle}
        onUserSelectListItem={() => this._onPressListItem(rowData)}
        icon={icon}
      />
    );
  }

  render() {
    return (
      <ListView
        style={styles.container}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
      />
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
