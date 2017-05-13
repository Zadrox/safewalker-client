import React, { Component } from 'react';
import { DrawerNavigator } from 'react-navigation';

import MapScreen from './screens/MapScreen';

export default App = DrawerNavigator({
  Home: {
    screen: MapScreen,
  }
})
