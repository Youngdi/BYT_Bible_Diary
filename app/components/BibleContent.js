import React, { Component, PureComponent } from 'react';
import {
  View,
  Text,
} from 'react-native';
import * as R from 'ramda';
import styled from "styled-components/native";
import I18n from 'react-native-i18n';
const StyledMainContainer = styled.View`
  margin-top:20px;
  margin-left:30px;
  margin-right:30px;
`;
const PharseCantainer = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  font-weight: 300;
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  margin-top: -10px;
  margin-right: 5px;
`;

export default class BibleContent extends PureComponent {
  constructor(props) {
    super(props);
  }
  renderBibleVerse = () => {
    const fontSize = this.props.fontSize;
    const lineHeight = this.props.lineHeight;
    const fontColor = this.props.fontColor;
    const fontFamily = this.props.fontFamily;
    if(R.isEmpty(this.props.content[0])) return;
    return (
      this.props.content.map( (item, i) => {
        const Verse = () => item.map(verseItem => {
          return (
            <Text
              key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`}
              onPress={(e) => this.props.handleVerseClick(verseItem)}
              ref={ r => this[verseItem.version + verseItem.book_name + verseItem.chapter_nr + verseItem.verse_nr] = r}
              style={{
                color: fontColor,
                backgroundColor: this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.highlightList[`${verseItem.id}-${verseItem.version}`] : 'transparent'
              }}
            >
              <PharseNumber
                key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}-number`}
                style={{
                  color: fontColor, // this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.readingMode ? '#ccc' : '#000': 'gray'
                  backgroundColor: this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.highlightList[`${verseItem.id}-${verseItem.version}`] : 'transparent'
                }}
                fontSize={fontSize - 6}
                ref={ r => this['number' + verseItem.version + verseItem.book_name +verseItem.chapter_nr + verseItem.verse_nr] = r}
              >
              {this.props.defaultLang == 'en' ? '  ': ''}{`${verseItem.verse_nr}`}{'  '}
              </PharseNumber>
              {`${verseItem.verse}`}
            </Text>
        )});
        return (
          <View onLayout={this.handlelayout}>
            <PharseCantainer
              fontSize={fontSize}
              fontColor={fontColor}
              lineHeight={lineHeight}
              fontFamily={fontFamily}
            >
            {Verse()}
            </PharseCantainer>
          </View>
         );
      })
    );
  }
  render() {
    return (
      <StyledMainContainer>
        {this.renderBibleVerse()}
      </StyledMainContainer>
    );
  }
}
