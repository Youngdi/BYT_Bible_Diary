import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const StyledArrowUp = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;
const shadowStyle = {
  shadowOpacity: 0.35,
  shadowOffset: {
    width: 0,
    height: 5
  },
  shadowColor: "#000",
  shadowRadius: 3,
  elevation: 5,
  backgroundColor:'#1E1E1E',
  width: 36,
  height: 36,
  borderColor:'#1E1E1E',
  borderWidth:4,
  borderStyle:'solid',
  borderRadius: 18,
  marginRight:20,
  marginTop:15,
};
export default class ArrowUp extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StyledArrowUp>
        <View style={shadowStyle}>
        <TouchableOpacity onPress={ () => this.props.handeleScrollTop()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} >
          <MaterialCommunityIcons
            name='arrow-collapse-up'
            size={23}
            color="#bbb"
            style={{marginTop:4,marginLeft:3,backgroundColor:'transparent'}}
          />
        </TouchableOpacity>
        </View>
      </StyledArrowUp>
    );
  }
}