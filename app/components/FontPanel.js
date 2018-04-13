import React, { Component } from 'react';
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Triangle from 'react-native-triangle';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Calendar } from 'react-native-calendars';
import Slider from "react-native-slider";
import styled from "styled-components/native";
import I18n from 'react-native-i18n';
import LottieView from 'lottie-react-native';
import { storeSetting } from '../store/index';
import { observer } from "mobx-react";

const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const StyledFontSettingModalContainer = styled.View`
  background-color: #1E1E1E;
  display: flex;
  flex-direction: column;
`;
const StyledFontSettingModalRow = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height:40px;
`;
const StyledFontSettingModalRow1 = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height:60px;
  border-width:0px;
  border-bottom-width: 1px;
  border-color:#333;
  margin-left:15px;
  margin-right:15px;
`;
const StyledFontSettingModalRow2 = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height:60px;
  border-width:0px;
  border-bottom-width: 1px;
  border-color:#333;
  margin-left:15px;
  margin-right:15px;
`;
const StyledFontSettingModalRow3 = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height:70px;
  margin-left:15px;
  margin-right:15px;
`;
const StyledFontSettingModalText = styled.Text`
  font-size:14px;
  color: white;
  font-weight:400;
`;
const StyledSettingRow = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: ${deviceWidth * 0.5}px;
`;
const StyledSliderContainer = styled.View`
  flex: 1;
  align-items: stretch;
  justify-content: center;
  margin-left: 15px;
  margin-right: 15px;
`;
const styles = StyleSheet.create({
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    shadowOpacity: 0.35,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
});

@observer 
export default class FontPanel extends Component {
  componentDidMount() {
    //this.animation.play(0,500);
  }
  render() {
    return (
    <Modal
      isVisible={this.props.isFontSettingModalVisible}
      onBackdropPress={() => this.props.toggleModalFontSetting()}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      backdropOpacity={0}
      style={{position:'absolute', bottom: isIphoneX() ? 40 : 20, width: deviceWidth * 0.8, left: deviceWidth * 0.045}}
    >
      <StyledFontSettingModalContainer>
        <StyledFontSettingModalRow1>
          <View>
            <StyledFontSettingModalText>{I18n.t('font_type')}</StyledFontSettingModalText>
          </View>
          <StyledSettingRow>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => storeSetting.handleSettingFontFamily('Avenir')}>
              <StyledFontSettingModalText style={{color: storeSetting.fontFamily == 'Avenir' ? '#F7B633': '#fff'}}>{I18n.t('font_type1')}</StyledFontSettingModalText>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => storeSetting.handleSettingFontFamily('PingFangSC-Semibold')}>
              <StyledFontSettingModalText style={{color: storeSetting.fontFamily == 'PingFangSC-Semibold' ? '#F7B633': '#fff'}}>{I18n.t('font_type2')}</StyledFontSettingModalText>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => storeSetting.handleSettingFontFamily('Times New Roman')}>
              <StyledFontSettingModalText style={{color: storeSetting.fontFamily == 'Times New Roman' ? '#F7B633': '#fff'}}>{I18n.t('font_type3')}</StyledFontSettingModalText>
            </TouchableOpacity>
          </StyledSettingRow>
        </StyledFontSettingModalRow1>
        <StyledFontSettingModalRow2>
        <View>
            <StyledFontSettingModalText>{I18n.t('font_size')}</StyledFontSettingModalText>
        </View>
          <StyledSettingRow>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => storeSetting.handleSettingFontSize(-2)} style={{marginRight: 5}}>
              <EvilIcons
                name='minus'
                size={30}
                color='#bbb'
              />
            </TouchableOpacity>
            <View style={{marginRight:3}}>
              <StyledFontSettingModalText>{storeSetting.fontSize}{'px'}</StyledFontSettingModalText>
            </View>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} onPress={() => storeSetting.handleSettingFontSize(2)} style={{marginRight:2, marginLeft:5}} >
              <EvilIcons
                name='plus'
                size={30}
                color='#bbb'
              />
            </TouchableOpacity>
          </StyledSettingRow>
        </StyledFontSettingModalRow2>
        <StyledFontSettingModalRow2>
          <View>
            <StyledFontSettingModalText>{I18n.t('font_line')}</StyledFontSettingModalText>
          </View>
          <StyledSettingRow>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}  onPress={() => storeSetting.handleSettingLineHeight(28)} style={{marginRight:3}}>
              <Ionicons
                name='ios-menu'
                size={25}
                color={storeSetting.lineHeight == 28 ? '#F7B633': '#bbb'}
              />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}  onPress={() => storeSetting.handleSettingLineHeight(33)} style={{marginRight:1}}>
              <Ionicons
                name='md-menu'
                size={30}
                color={storeSetting.lineHeight == 33 ? '#F7B633': '#bbb'}
              />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}  onPress={() => storeSetting.handleSettingLineHeight(38)} >
              <SimpleLineIcons
                name='menu'
                size={30}
                color={storeSetting.lineHeight == 38 ? '#F7B633': '#bbb'}
              />
            </TouchableOpacity>
          </StyledSettingRow>
        </StyledFontSettingModalRow2>
        <StyledFontSettingModalRow3>
          <TouchableOpacity onPress={storeSetting.handleSettingReadingMode} style={{backgroundColor:'white', width:35, height:35, borderColor: storeSetting.readingMode == 1 ? '#F7B633': '#bbb', borderWidth:1, borderRadius:5}}>
            <Ionicons
              name='ios-moon'
              size={30}
              color={storeSetting.readingMode == 1 ? '#F7B633': '#000'}
              style={{marginLeft:6, marginTop:1, backgroundColor:'transparent'}}
            />
          </TouchableOpacity>
          <View style={{marginLeft:40}}>
            <Ionicons
              name='ios-sunny'
              size={20}
              color='#bbb'
            />
          </View>
          <StyledSliderContainer>
            <Slider
              thumbStyle={styles.thumb}
              minimumValue={0.3}
              maximumValue={1}
              minimumTrackTintColor='#F7B633'
              maximumTrackTintColor='#d3d3d3'
              thumbTintColor='#1a9274'
              value={storeSetting.brightnessValue}
              onValueChange={(value) => storeSetting.handleSliderValueChange(value)}
            />
          </StyledSliderContainer>
          <View style={{marginRight:7}}>
            <Ionicons
              name='ios-sunny'
              size={30}
              color='#ddd'
            />
          </View>
        </StyledFontSettingModalRow3>
      </StyledFontSettingModalContainer>
      <Triangle 
          style={{position:'relative', left: deviceWidth * 0.39}}
          width={20}
          height={10}
          color={'#1E1E1E'}
          direction={'down'}
      />
    </Modal>
    );
  }
}