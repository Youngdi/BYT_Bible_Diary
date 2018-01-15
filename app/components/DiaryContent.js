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
  height: deviceHeight,
  width: deviceWidth
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
  font-weight: 300;
`;
const Pharse = styled.Text`
  font-size: ${props => props.fontSize}px;
  font-weight: 300;
`;
export default class DiaryContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchor: [],
    }
  }
  handleTitleLayout = (e) => {
    console.log(e);
    this.setState({
      anchor:[...this.state.anchor, e.nativeEvent.layout.y],
    })
    console.log(e.nativeEvent.layout);
  }
  renderTitle = () => {
    if(this.props.content.length == 0) return (<Text>讀取中...</Text>);
    return(
      <Title fontSize={this.props.fontSize + 6}>
      {`${this.props.date.month}月${this.props.date.day}日`}
      {
        this.props.content.map( (item, i) => {
          return(
            <Text
              onPress={(e) => {
                console.log(this.aaa.setNativeProps({style:{color: 'red'}}))
                // this.props.contentView.root.scrollTo({y: 100, animated: true})}
              }}
              onPressOut={(e) => {
                console.log(this.aaa.setNativeProps({style:{color: 'blue'}}))
                // this.props.contentView.root.scrollTo({y: 100, animated: true})}
              }}
              ref={ r => this.aaa = r}
              style={{fontSize:10, color: 'blue', textDecorationLine:'underline', textDecorationStyle:'dotted'}}>{'     '}{`${item[0].book_ref}${item[0].chapter_nr}`}{''}
            </Text>
          );
        })
      }
      </Title>
    );
  }
  renderVerse = () => {
    if(this.props.content.length == 0) return;
    return (
      this.props.content.map(item => {
        const Title = 
          <BookTitle
            onLayout={this.handleTitleLayout}
            fontSize={this.props.fontSize + 2}
          >
          {'\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}章${item[0].verse_nr}-${item[0].verse_nr == '1' ? item.length : item[item.length -1].verse_nr}節`}{'\n'}{'\n'}
          </BookTitle>
        const Verse = item.map(verseItem => {
          return(
            <Pharse fontSize={this.props.fontSize}>
            <PharseNumber fontSize={this.props.fontSize - 6}>{`${verseItem.verse_nr}`}{'  '}</PharseNumber>
            {`${verseItem.verse}`}
            </Pharse>
          )});
        return [Title, Verse];
      })
    );
  }
  render() {
    return (
      <StyledDiaryText 
        fontColor={this.props.fontColor}
        fontSize={this.props.fontSize}
        lineHeight={this.props.lineHeight}
        fontFamily={this.props.fontFamily}
      >
        {this.renderTitle()}
        {this.renderVerse()}
      </StyledDiaryText>
    );
  }
}