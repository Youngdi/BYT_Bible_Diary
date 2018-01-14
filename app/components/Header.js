import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import styled from "styled-components/native";

const StyledHeader = Animated.createAnimatedComponent(styled.View`
  z-index: 2;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${Platform.OS == 'ios' ? 25 : 0};
  height: 6%;
`)

export default class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      transformY: new Animated.Value(0),
    };
  }
  render() {
    this.state.fadeInOpacity.setValue(this.props.fullScreenMode ? 1 : 0);
    this.state.transformY.setValue(this.props.fullScreenMode ? 0 : -10);
    Animated.parallel([
      Animated.timing(this.state.fadeInOpacity, {
        toValue: this.props.fullScreenMode ? 0 : 1,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(this.state.transformY, {
        toValue: this.props.fullScreenMode ? -10 : 0,
        duration: 500,
        easing: Easing.linear
      })
    ]).start();
    return (
      <StyledHeader style={{
          opacity: this.state.fadeInOpacity,
          transform: [
            {
              translateY: this.state.transformY,
            }
          ],
        }}
      >
        {/* <TouchableOpacity onPress={ ()=> this.props.navigation.goBack()}>
          <MaterialIcons
            name='keyboard-arrow-left'
            size={45}
            color='black'
          />
        </TouchableOpacity> */}
        <View style={{backgroundColor:'#111', width: 36, height: 36, borderColor:'#111', borderWidth:4, borderStyle:'solid', borderRadius: 18, marginRight:20, marginTop:15}}>
        <TouchableOpacity onPress={()=> this.props.toggleModal()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} >
          <EvilIcons
            name='calendar'
            size={30}
            color='#bbb'
            style={{width: 26, height: 26, marginTop:3, marginLeft:-1, backgroundColor:'transparent'}}
          />
        </TouchableOpacity>
        </View>
      </StyledHeader>
    );
  }
}