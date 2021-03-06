import React, { Component, PureComponent } from 'react';
import {
  View,
  Text,
} from 'react-native';
import * as R from 'ramda';
import styled from "styled-components/native";
import I18n from 'react-native-i18n';
import Verse from './Verse';
import {checkVerseSelected, checkVerseHighlighted} from '../api/tooltip';
import { storeSetting } from '../store/index';
import { observer } from "mobx-react";

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
  padding-bottom: 50px;
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  margin-top: -10px;
  margin-right: 5px;
`;

@observer
export default class BibleContent extends PureComponent {
  renderBibleVerse = () => {
    if(R.isEmpty(this.props.content[0])) return;
    return (
      this.props.content.map( (item, i) => {
        return (
          <View onLayout={this.props.handlelayout}>
            <PharseCantainer
              fontSize={storeSetting.fontSize}
              fontColor={storeSetting.fontColor}
              lineHeight={storeSetting.lineHeight}
              fontFamily={storeSetting.fontFamily}
            >
            {item.map(verseItem => {
              return(
                <Verse
                  targetVerse={verseItem.verse_nr == this.props.verse_nr}
                  lineHeight={storeSetting.lineHeight}
                  fontColor={storeSetting.fontColor}
                  fontSize={storeSetting.fontSize}
                  verseItem={verseItem}
                  language={storeSetting.language}
                  handleVerseClick={this.props.handleVerseClick}
                  selected={checkVerseSelected(this.props.selectVerse, `${verseItem.id}-${verseItem.version}`)}
                  highlightColor={checkVerseHighlighted(this.props.highlightList, verseItem)}
                />
              );
            })}
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
