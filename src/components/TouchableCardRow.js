import React, {PropTypes} from 'react';
import { TouchableNativeFeedback, Text, View } from 'react-native';
import { Icon } from 'native-base';

const TouchableCardRow = ({text, onPress, icon, color}) => (
  <View style={{padding: 0}}>
    <TouchableNativeFeedback
      onPress={onPress}
      background={TouchableNativeFeedback.SelectableBackground()}>
      <View
        style={{flex: 1, height: 56, flexDirection: 'row', alignItems: 'center'}}>
        <Icon style={{marginLeft: 16, marginRight: 16, fontSize: 24, color: `${color}`}} name={icon}/>
        <Text>{text}</Text>
      </View>
    </TouchableNativeFeedback>
  </View>
);

export default TouchableCardRow;
