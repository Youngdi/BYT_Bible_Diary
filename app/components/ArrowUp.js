import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const StyledArrowUp = Animated.createAnimatedComponent(styled.View`
  z-index: 2;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: ${isIphoneX() ? 90 : 60};
  height: 6%;
`)
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
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      transformY: new Animated.Value(deviceHeight),
    };
  }
  componentDidMount() {
    this.state.fadeInOpacity.setValue(this.props.fullScreenMode ? 0 : 1);
    this.state.transformY.setValue(this.props.fullScreenMode ? -10 : 0);
    Animated.parallel([
      Animated.timing(this.state.fadeInOpacity, {
        toValue: this.props.fullScreenMode ? 1 : 0,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(this.state.transformY, {
        toValue: this.props.fullScreenMode ? 0 : -10,
        duration: 500,
        easing: Easing.linear
      })
    ]).start();
  }
  componentDidUpdate() {
    this.state.fadeInOpacity.setValue(this.props.fullScreenMode ? 0 : 1);
    this.state.transformY.setValue(this.props.fullScreenMode ? -10 : 0);
    Animated.parallel([
      Animated.timing(this.state.fadeInOpacity, {
        toValue: this.props.fullScreenMode ? 1 : 0,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(this.state.transformY, {
        toValue: this.props.fullScreenMode ? 0 : -10,
        duration: 500,
        easing: Easing.linear
      })
    ]).start();
  }
  render() {
    if(this.props.content.length == 0) return (<View></View>);
    return (
      <StyledArrowUp style={{
          opacity: this.state.fadeInOpacity,
          transform: [
            {
              translateY: this.state.transformY,
            }
          ],
        }}
      >
        <View style={shadowStyle}>
        <TouchableOpacity onPress={ () => this.props.handeleScrollTop()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} >
          <Ionicons
            name='md-arrow-round-up'
            size={30}
            color="#bbb"
            style={{zIndex:10,width: 26, height: 26, marginLeft:4, backgroundColor:'transparent'}}
          />
        </TouchableOpacity>
        </View>
      </StyledArrowUp>
    );
  }
}