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
const StyledLangListText = styled.Text`
  margin-top: -2px;
  color: #bbb;
  font-size: 16px;
`;
export default class Footer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      transformY: new Animated.Value(0),
    };
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
          {this.props.defaultLang == 'cht' ? 
          <TouchableOpacity onPress={() => this.props.handeleChangeLang('chs')} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <StyledLangListText>繁</StyledLangListText>
          </TouchableOpacity>
          : null}
          {this.props.defaultLang == 'chs' ?
          <TouchableOpacity onPress={() => this.props.handeleChangeLang('en')} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <StyledLangListText>簡</StyledLangListText>
          </TouchableOpacity>
            : null}
          {this.props.defaultLang == 'en' ? 
          <TouchableOpacity onPress={() => this.props.handeleChangeLang('ja')} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <StyledLangListText>En</StyledLangListText>
          </TouchableOpacity>
          : null}
          {this.props.defaultLang == 'ja' ? 
          <TouchableOpacity onPress={() => this.props.handeleChangeLang('cht_en')} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <StyledLangListText>日</StyledLangListText>
          </TouchableOpacity>
          : null}
          {this.props.defaultLang == 'cht_en' ? 
          <TouchableOpacity onPress={() => this.props.handeleChangeLang('cht')} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <StyledLangListText style={{fontSize:12}}>中英</StyledLangListText>
          </TouchableOpacity>
          : null}
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