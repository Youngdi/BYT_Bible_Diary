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
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionButton from './ActionButton';
import FontAwesome from 'react-native-vector-icons/MaterialIcons';

var {
  height: deviceHeight
} = Dimensions.get('window');
let footerBottom = '16';
let footerHeight = '8%';
if(deviceHeight > 700) {
  footerBottom = isIphoneX() ? '30' : '16';
}
if(deviceHeight < 579 && deviceHeight > 481) footerBottom = '6'; 
if(deviceHeight < 481) footerBottom = '8';
if(deviceHeight < 481){
  footerHeight = '9%';
} else {
  footerHeight = '8%';
}
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
  padding-bottom: ${footerBottom}px;
  height: ${footerHeight};
  background-color: black;
`)
const StyledLangListText = styled.Text`
  margin-top: -2px;
  color: #bbb;
  font-size: 16px;
`;
const StyledLangText = styled.Text`
  fontSize: 16px;
  height: 18px;
  color: white;
`;
export default class Footer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      transformY: new Animated.Value(0),
    };
  }
  closeActionButton = () => {
    this.actionButton.reset();
  }
  render() {
    if(this.props.content.length == 0) return (<View></View>);
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
    let selectLangText = 'cht';
    let langList = [
      <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
    ];
    if(this.props.defaultLang == 'cht'){
      selectLangText = '繁';
      langList = [
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'chs'){
      selectLangText = '簡';
      langList = [
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'en'){
      selectLangText = 'EN';
      langList = [
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'ja'){
      selectLangText = '日';
      langList = [
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'cht_en'){
      selectLangText = '中英';
      langList = [
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#000' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
      ];
    }
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
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={()=> this.props.handlePreviousDay()}>
          <MaterialIcons
            name='arrow-back'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => this.props.getDiaryBiblePhrase()}>
          <MaterialCommunityIcons
            name='bible'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={()=> this.props.toggleModal()}>
          <MaterialIcons
            name='font-download'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <ActionButton
          onPress={this.props.closeHeaderActionButton}
          ref={r => this.actionButton = r}
          degrees={0}
          position={'center'}
          icon={<StyledLangText>{selectLangText}</StyledLangText>}
        >
          {langList}
        </ActionButton>
        <View style={{opacity:0, zIndex:-999}}>
          <StyledLangListText>{'  '}</StyledLangListText>
        </View>
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={()=> this.props.handleNextDay()} >
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