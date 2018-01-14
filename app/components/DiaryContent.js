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
    let content = [...this.props.content];
    return(
      <Title fontSize={this.props.fontSize + 6}>
      {`${this.props.date.month}月${this.props.date.day}日`}
      {
        content.map( (item, i) => {
          return(
            <Text
              onPress={() => this.props.contentView.root.scrollTo({y: 100, animated: true})}
              key={`Hint-${item[0].book_ref}-${item[0].chapter_nr}`}
              style={{fontSize:10}}>{'     '}{`${item[0].book_ref}${item[0].chapter_nr}`}{''}
            </Text>
          );
        })
      }
      </Title>
    );
  }
  renderVerse = () => {
    let content = [...this.props.content];
    return (
      content.map(item => {
        const Title = 
          <BookTitle
            onLayout={this.handleTitleLayout}
            key={`title-${item[0].book_ref}`}
            fontSize={this.props.fontSize + 2}
          >
          {'\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}章${item[0].verse_nr}-${item[0].verse_nr == '1' ? item.length : item[item.length -1].verse_nr}節`}{'\n'}{'\n'}
          </BookTitle>
        const Verse = item.map(verseItem => {
          return(
            <Pharse key={`Pharsetitle-${verseItem.book_ref}-${verseItem.verse_nr}`} fontSize={this.props.fontSize}>
            <PharseNumber key={`PharseNumber-${verseItem.book_ref}-${verseItem.verse_nr}`} fontSize={this.props.fontSize - 6}>{`${verseItem.verse_nr}`}{'  '}</PharseNumber>
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