import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import styled from "styled-components/native";
import I18n from 'react-native-i18n';
import * as R from 'ramda';

const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  margin-top: -10px;
  margin-right: 5px;
  textDecorationLine: ${props => props.textDecorationLine};
  textDecoration-style: dotted;
  font-family: ${props => props.fontFamily};
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
  line-height: ${props => props.lineHeight};
  font-weight: 300;
`;
const PharseText = styled.Text`
  font-family: ${props => props.fontFamily};
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
  textDecoration-line: ${props => props.textDecorationLine};
  textDecoration-style: dotted;
  line-height: ${props => props.lineHeight};
  font-weight: 300;
`;
export default class Verse extends Component {
  state = {
    selected: false,
  }
  handleVerseClick = () => {
    this.setState({
      selected: !this.state.selected,
    });
    this.props.handleVerseClick && this.props.handleVerseClick(this.props.verseItem);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.selected != nextProps.selected) {
      if(nextProps.selected == this.state.selected) {
        return false;
      }
      this.setState({
        selected: nextProps.selected,
      });
    }
    if(!R.equals(this.state, nextState)) return true;
    if(R.equals(this.props, nextProps)) return false;
    return true;
  }
  render() {
    return (
      <PharseText
        onPress={this.handleVerseClick}
        color={this.state.selected ? '#CF1B1B' : this.props.fontColor}
        backgroundColor={this.props.highlightColor}
        textDecorationLine={this.state.selected ? 'underline' : 'none'}
        lineHeight={this.props.lineHeight}
        fontFamily={this.props.fontFamily}
      >
        <PharseNumber
          fontSize={this.props.fontSize - 6}
          color={this.state.selected ? '#CF1B1B' : this.props.fontColor}
          backgroundColor={this.props.highlightColor}
          textDecorationLine={this.state.selected ? 'underline' : 'none'}
          lineHeight={this.props.lineHeight}
          fontFamily={this.props.fontFamily}
        >
          {this.props.defaultLang == 'en' ? '  ': ''}{`${this.props.verseItem.verse_nr}`}{'  '}
        </PharseNumber>
        {`${this.props.verseItem.verse}`}{this.props.defaultLang == 'cht_en' ? '\n' : ''}
      </PharseText>
    );
  }
}
