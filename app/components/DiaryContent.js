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
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
var {
  height: deviceHeight
} = Dimensions.get('window');

const StyledDiaryText = styled.Text`
  margin-left:30px;
  margin-right:30px;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-weight: 600;
  font-family: ${props => props.fontFamily};
`;
const Title = styled.Text`
  font-weight: bold;
  font-size: ${props => props.fontSize}px;
`;
const BookTitle = styled.Text`
  font-weight: 800;
  font-size: ${props => props.fontSize}px;
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: gray;
  margin-top: -10px;
  margin-right: 5px;
`;
const Pharse = styled.Text`
  font-size: ${props => props.fontSize}px;
`;
export default class DiaryContent extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <StyledDiaryText 
        fontColor={this.props.fontColor}
        fontSize={this.props.fontSize}
        lineHeight={this.props.lineHeight}
        fontFamily={this.props.fontFamily}
      >
        <Title fontSize={this.props.fontSize + 6}>
          1月12號
        </Title>
        <BookTitle fontSize={this.props.fontSize + 2}>
        {'\n'}{'\n'} 詩篇1章1-10節 {'\n'}{'\n'}
        </BookTitle>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>1{'  '}</PharseNumber>不從惡人的計謀，不站罪人的道路，不坐褻慢人的座位，</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>2{'  '}</PharseNumber>惟喜愛耶和華的律法，晝夜思想，這人便為有福！</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>3{'  '}</PharseNumber>他要像一棵樹栽在溪水旁，按時候結果子，葉子也不枯乾。凡他所做的盡都順利。</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>4{'  '}</PharseNumber>惡人並不是這樣，乃像糠粃被風吹散。</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>5{'  '}</PharseNumber>因此，當審判的時候惡人必站立不住；罪人在義人的會中也是如此。</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>6{'  '}</PharseNumber>因為耶和華知道義人的道路；惡人的道路卻必滅亡。</Pharse>
        <BookTitle fontSize={this.props.fontSize + 2}>
        {'\n'}{'\n'} 詩篇1章1-10節 {'\n'}{'\n'}
        </BookTitle>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>1{'  '}</PharseNumber>不從惡人的計謀，不站罪人的道路，不坐褻慢人的座位，</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>2{'  '}</PharseNumber>惟喜愛耶和華的律法，晝夜思想，這人便為有福！</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>3{'  '}</PharseNumber>他要像一棵樹栽在溪水旁，按時候結果子，葉子也不枯乾。凡他所做的盡都順利。</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>4{'  '}</PharseNumber>惡人並不是這樣，乃像糠粃被風吹散。</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>5{'  '}</PharseNumber>因此，當審判的時候惡人必站立不住；罪人在義人的會中也是如此。</Pharse>
        <Pharse fontSize={this.props.fontSize}><PharseNumber fontSize={this.props.fontSize - 6}>6{'  '}</PharseNumber>因為耶和華知道義人的道路；惡人的道路卻必滅亡。</Pharse>
      </StyledDiaryText>
    );
  }
}