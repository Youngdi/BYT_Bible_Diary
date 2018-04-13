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
import ActionButton from './ActionButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { storeSetting } from '../store/index';
import { observer } from "mobx-react";

var {
  height: deviceHeight
} = Dimensions.get('window');

const StyledFooter = styled.View`
  z-index: 2;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-bottom: ${isIphoneX() ? '16' : '0'}px;
  height: ${isIphoneX() ? 60 : deviceHeight / 17};
  background-color: #1E1E1E;
`;
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

const StyledSelectedLangText = styled.Text`
  margin-top:${props => props.marginTop}px;  
  fontSize: 16px;
  height: 18px;
  color: white;
`;
@observer
export default class Footer extends PureComponent {
  constructor(props) {
    super(props);
  }
  closeActionButton = () => {
    this.actionButton && this.actionButton.reset();
  }
  render() {
    let selectLangText = 'cht';
    let langList = [
      <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
      <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
      // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
    ];
    if(storeSetting.language == 'cht'){
      selectLangText = '繁';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(storeSetting.language == 'chs'){
      selectLangText = '簡';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(storeSetting.language == 'en'){
      selectLangText = 'EN';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(storeSetting.language == 'ja'){
      selectLangText = '日';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        // <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht_en')}><StyledLangText>中英</StyledLangText></ActionButton.Item>,
      ];
    }
    if(storeSetting.language == 'cht_en'){
      selectLangText = '中英';
      langList = [
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('cht')}><StyledLangText>繁</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('chs')}><StyledLangText>簡</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('en')}><StyledLangText>EN</StyledLangText></ActionButton.Item>,
        <ActionButton.Item buttonColor='#1E1E1E' onPress={() => this.props.handleChangeLang('ja')}><StyledLangText>日</StyledLangText></ActionButton.Item>,
      ];
    }
    return (
      <StyledFooter>
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={()=> this.props.handlePreviousDay()}>
          <MaterialIcons
            name='arrow-back'
            size={20}
            color='#bbb'
          />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => this.props.getDiaryBiblePhrase()}>
          <SimpleLineIcons
            name='emotsmile'
            size={22}
            color='#bbb'
          />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={()=> this.props.toggleModal()}>
          <FontAwesome
            name='font'
            size={18}
            color='#bbb'
          />
        </TouchableOpacity>
        {
        Platform.OS == 'ios' ?
          <ActionButton
            buttonColor="rgba(30,30,30,1)"
            onPress={this.props.closeHeaderActionButton}
            ref={r => this.actionButton = r}
            degrees={0}
            position={'center'}
            icon={<StyledSelectedLangText marginTop={storeSetting.language == 'en' ? -4 : 0}>{selectLangText}</StyledSelectedLangText>}
          >
            {langList}
          </ActionButton> : null
        }
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