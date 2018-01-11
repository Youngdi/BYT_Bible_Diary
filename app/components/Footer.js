import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
var {
  height: deviceHeight
} = Dimensions.get('window');

const StyledFooter = Animated.createAnimatedComponent(styled.View`
  z-index: 2;
  position: absolute;
  top: ${isIphoneX() ? deviceHeight - 65: deviceHeight - 40};
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-bottom: ${isIphoneX() ? '30': '16'}px;
  height: ${isIphoneX() ? '8%': '8%'};
  background-color: black;
`)

export default class Footer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      transformY: new Animated.Value(0),
    };
  }
  render() {
    this.state.fadeInOpacity.setValue(this.props.fullScreenMode ? 1 : 0);
    this.state.transformY.setValue(this.props.fullScreenMode ? 0 : 10);
    Animated.parallel([
      Animated.timing(this.state.fadeInOpacity, {
        toValue: this.props.fullScreenMode ? 0 : 1,
        duration: 500,
        easing: Easing.linear,
      }),
      Animated.timing(this.state.transformY, {
        toValue: this.props.fullScreenMode ? 10 : 0,
        duration: 500,
        easing: Easing.linear,
      })
    ]).start();
    return (
      <StyledFooter 
        style={{
          opacity: this.state.fadeInOpacity,
          transform: [
            {
              translateY: this.state.transformY,
            }
          ],
        }}
      >
        <TouchableOpacity onPress={()=> this.props.handlePreviousDay()} style={{padding:10}}>
          <MaterialIcons
            name='arrow-back'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.getDiaryBiblePhrase()} style={{padding:3}}>
          <MaterialCommunityIcons
            name='bible'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> this.props.toggleModal()} style={{padding:0}} style={{padding:10}}>
          <MaterialIcons
            name='font-download'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <View style={{padding:3}}>
          <Text style={{marginTop:-2, color:'#bbb', fontSize:16}}>繁</Text>
        </View>
        <TouchableOpacity onPress={()=> this.props.handleNextDay()} style={{padding:10}}>
          <MaterialIcons
            name='arrow-forward'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
      </StyledFooter>
    );
  }
}