import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import ActionButton from 'react-native-action-button';

const StyledSelectedLangText = styled.Text`
  margin-top:${props => props.marginTop}px;  
  fontSize: 16px;
  height: 18px;
  color: white;
`;
const StyledLangText = styled.Text`
  margin-top:-3px;
  fontSize: 16px;
  height: 18px;
  color: white;
`;
export default class AndroidActionButton extends PureComponent {
  render() {
    let selectLangText = 'cht';
    let langList = [
      <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
      // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
    ];
    if(this.props.defaultLang == 'cht'){
      selectLangText = '繁';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'chs'){
      selectLangText = '簡';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'en'){
      selectLangText = 'EN';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'ja'){
      selectLangText = '日';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(this.props.defaultLang == 'cht_en'){
      selectLangText = '中英';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handeleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
      ];
    }
    return (
      <ActionButton
        onPress={this.closeHeaderActionButton}
        style={{zIndex:10, opacity:this.props.opacity, bottom:-this.props.offsetY + 3}}
        buttonColor="rgba(0,0,0,0)"
        renderIcon={() => <StyledSelectedLangText marginTop={this.props.defaultLang == 'en' ? -3 : 0}>{selectLangText}</StyledSelectedLangText>}
        radius={100}
        size={36}
        position={'right'}
        hideShadow={false}
        offsetY={0}
        offsetX={86}
        degrees={0}
        nativeFeedbackRippleColor={'rgba(255,255,255,0)'}
      >
        {langList}
      </ActionButton>
    );
  }
}