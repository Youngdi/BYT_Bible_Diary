import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Text,
  Botton,
} from 'react-native';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
import ReactNativeComponentTree from 'react-native/Libraries/Renderer/shims/ReactNativeComponentTree';
var {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const StyledDiaryText = styled.View`
  margin-left:30px;
  margin-right:30px;
`;
const Title = styled.Text`
  font-weight: bold;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
`;
const BookTitle = styled.Text`
  font-weight: 800;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  color: gray;
  margin-top: -10px;
  margin-right: 5px;
  font-weight: 300;
`;
const Pharse = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  font-weight: 300;
`;
const Pharse1 = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  font-weight: 300;
`;
export default class DiaryContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchor: [],
      selectVerse: [],
      selectVerseRef: [],
    }
  }
  renderTitle = () => {
    if(this.props.content.length == 0) return (<Text>讀取中...</Text>);
    return(
      <Title 
        fontColor={this.props.fontColor}
        lineHeight={this.props.lineHeight}
        fontFamily={this.props.fontFamily}
        fontSize={this.props.fontSize + 6}
      >
      {`${this.props.date.month}/${this.props.date.day}`}
      {
        this.props.content.map( (item, i) => {
          return(
            <Text
              onPress={(e) => {
                this.state.selectVerseRef.map(item => item.setNativeProps({style:{color: this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
                this.setState({
                  selectVerse: [],
                  selectVerseRef: [],
                });
                // this.props.contentView.root.scrollTo({y: 100, animated: true})
              }}
              ref={ r => this['link' + i] = r}
              style={{fontSize:10, color: 'blue'}}>{'     '}{`${item[0].book_ref}${item[0].chapter_nr}`}{''}
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
      this.props.content.map( (item, i) => {
        const Title = 
          <BookTitle
            ref={r => this['anchor' +i] = r}
            fontSize={this.props.fontSize + 2}
            fontColor={this.props.fontColor}
            lineHeight={this.props.lineHeight}
            fontFamily={this.props.fontFamily}
          >
          {'\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}章${item[0].verse_nr}-${item[0].verse_nr == '1' ? item.length : item[item.length -1].verse_nr}節`}{'\n'}{'\n'}
          </BookTitle>
        const Verse = item.map(verseItem => {
          return(
            <Pharse 
              fontSize={this.props.fontSize}
              fontColor={this.props.fontColor}
              lineHeight={this.props.lineHeight}
              fontFamily={this.props.fontFamily}
              onPress={(e) => {
                this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color: '#BB0029', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                this.setState({
                  selectVerse: [...this.state.selectVerse, {...verseItem}],
                  selectVerseRef: [...this.state.selectVerseRef, this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr]]
                })
              }}
              ref={ r => this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr] = r}
            >
              <PharseNumber
                fontSize={this.props.fontSize - 6}
                fontColor={this.props.fontColor}
                lineHeight={this.props.lineHeight}
                fontFamily={this.props.fontFamily}
              >
                {`${verseItem.verse_nr}`}{'  '}
              </PharseNumber>
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
        <View>
          <Pharse1
            fontColor={this.props.fontColor}
            fontSize={this.props.fontSize}
            lineHeight={this.props.lineHeight}
            fontFamily={this.props.fontFamily}
          >
            {this.renderVerse()}
          </Pharse1>
        </View>
      </StyledDiaryText>
    );
  }
}