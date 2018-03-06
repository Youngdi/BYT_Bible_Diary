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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styled from "styled-components/native";
import ActionButton from 'react-native-action-button';
var {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const StyledHeader = styled.View`
  z-index: 2;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 25px;
  height: ${Platform.OS == 'ios' ? '6%' : deviceHeight};
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
export default class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }
  closeActionButton = () => {
    this.actionButton && this.actionButton.reset();
  }
  navigateTo =(toWhere) => {
    this.props.navigateTo(toWhere);
  }
  render() {
    return (
      <StyledHeader pointerEvents={'box-none'}>
        <View></View>
        <ActionButton
          buttonColor="rgba(30,30,30,1)"
          renderIcon={() => <SimpleLineIcons name='drawer' size={20} color='#bbb' />}
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
          <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.navigateTo('BibleSearch')}>
            <Ionicons
              name='ios-search-outline'
              size={24}
              color='#bbb'
              style={{width: 26, height: 26, marginTop:3, marginLeft:8, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.navigateTo('Note')}>
            <Ionicons
              name='ios-create-outline'
              size={24}
              color='#bbb'
              style={{width: 26, height: 26, marginTop:0, marginLeft:12, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.navigateTo('Bookmark')}>
            <Ionicons
              name='ios-bookmarks-outline'
              size={24}
              color='#bbb'
              style={{width: 26, height: 26, marginTop:2, marginLeft:8, backgroundColor:'transparent'}}
            />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.openControlPanel()}>
            <Ionicons
              name='ios-book-outline'
              size={24}
              color='#bbb'
              style={{width: 26, height: 26, marginTop:2, marginLeft:9, backgroundColor:'transparent'}}
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
