import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from "styled-components/native";
import ActionButton from './ActionButton2';
var {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const StyledHeader = Animated.createAnimatedComponent(styled.View`
  z-index: 2;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${Platform.OS == 'ios' ? 25 : 0};
  height: 6%;
`)

export default class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      transformY: new Animated.Value(0),
      active: false,
    };
  }
  closeActionButton = () => {
    this.actionButton.reset();
  }
  navigateTo =(toWhere) => {
    this.props.navigateTo(toWhere);
  }
  render() {
    if(this.props.content.length == 0) return (<View></View>);
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
      <View></View>
        <ActionButton ref={r => this.actionButton = r} radius={100} size={36} position={'left'} >
          <ActionButton.Item buttonColor='#000' onPress={() => this.props.navigateTo('More')}>
            <Ionicons
              name='ios-more'
              size={30}
              color='#ddd'
              style={{width: 26, height: 26, marginTop:-4, marginLeft:7, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#000' onPress={() => this.props.navigateTo('Bookmark')}>
            <Foundation
              name='book-bookmark'
              size={28}
              color='#ddd'
              style={{width: 26, height: 26, marginTop:-4, marginLeft:9, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#000' onPress={() => this.props.navigateTo('Note')}>
            <SimpleLineIcons
              name='note'
              size={21}
              color='#ddd'
              style={{width: 26, height: 26, marginTop:0, marginLeft:8, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#000' onPress={() => this.props.navigateTo('Bible')}>
            <MaterialCommunityIcons
              name='book-open-page-variant'
              size={21}
              color='#ddd'
              style={{width: 26, height: 26, marginTop:0, marginLeft:8, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
        </ActionButton>
        <View style={{backgroundColor:'#111', width: 36, height: 36, borderColor:'#111', borderWidth:4, borderStyle:'solid', borderRadius: 18, marginRight:20, marginTop:15}}>
          <TouchableOpacity onPress={()=> this.props.toggleModal()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
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