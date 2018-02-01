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
import Entypo from 'react-native-vector-icons/Entypo';
import styled from "styled-components/native";
import ActionButton from 'react-native-action-button';
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
`);

const shadowStyle = {
  shadowOpacity: 0.35,
  shadowOffset: {
    width: 0,
    height: 5
  },
  shadowColor: "#000",
  shadowRadius: 3,
  elevation: 5,
  backgroundColor:'#111',
  width: 36,
  height: 36,
  borderColor:'#111',
  borderWidth:4,
  borderStyle:'solid',
  borderRadius: 18,
  marginRight:20,
  marginTop:15,
};
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
        <ActionButton
          renderIcon={() => <SimpleLineIcons name='drawer' size={20} color='#ddd' />}
          verticalOrientation={'down'}
          onPress={this.props.closeFooterActionButton}
          ref={r => this.actionButton = r}
          radius={100}
          size={36}
          position={'left'}
          hideShadow={false}
          offsetY={15}
          offsetX={20}
          degrees={0}
        >
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
          <ActionButton.Item buttonColor='#000' onPress={() => this.props.openControlPanel()}>
            <MaterialCommunityIcons
              name='book-open-page-variant'
              size={21}
              color='#ddd'
              style={{width: 26, height: 26, marginTop:0, marginLeft:8, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
        </ActionButton>
        <View style={shadowStyle}>
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
