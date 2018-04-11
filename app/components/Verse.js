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
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
  line-height: ${props => props.lineHeight};
  font-weight: 300;
`;
const PharseText = styled.Text`
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
  textDecoration-line: ${props => props.textDecorationLine};
  textDecoration-style: dotted;
  line-height: ${props => props.lineHeight};
  font-weight: 300;
`;
// const runHint = ([x, ...xs], p = Promise.resolve()) => x ? runHint(xs, p.then(x)): p;
export default class Verse extends Component {
  constructor(props){
    super(props);
    this.showHintTimes = props.targetVerse ? 4 : 0;
  }
  state = {
    selected: false,
  }
  componentDidMount(){
    setTimeout(() => {
      this.props.targetVerse ? this.runHint(new Array(this.showHintTimes).fill(1).map(() => this.showHint)) : null;
    }, 500);
  }
  runHint = ([x, ...xs], p = Promise.resolve()) => x ? this.runHint(xs, p.then(x)): p;
  showHint = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      this.setState({
        selected: true,
      });
      setTimeout(() => {
        this.setState({
          selected: false,
        });
        this.showHintTimes = this.showHintTimes - 1;
        resolve();
      }, 400);
    }, 400);
  });
  handleVerseClick = () => {
    if(this.showHintTimes > 0) return;
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
        color={this.state.selected ? '#CF1B1B' : this.props.highlightColor == 'transparent' ? this.props.fontColor : this.props.highlightColor.bgColor == 'transparent' ? this.props.fontColor : this.props.highlightColor.fontColor}
        backgroundColor={this.props.highlightColor == 'transparent' ? this.props.highlightColor : R.isEmpty(this.props.highlightColor.bgColor) ? this.props.highlightColor : this.props.highlightColor.bgColor}
        textDecorationLine={this.state.selected ? 'underline' : 'none'}
        lineHeight={this.props.lineHeight}
      >
        <PharseNumber
          fontSize={this.props.fontSize - 6}
          color={this.state.selected ? '#CF1B1B' : this.props.highlightColor == 'transparent' ? this.props.fontColor : this.props.highlightColor.bgColor == 'transparent' ? this.props.fontColor : this.props.highlightColor.fontColor}
          backgroundColor={this.props.highlightColor == 'transparent' ? this.props.highlightColor : R.isEmpty(this.props.highlightColor.bgColor) ? this.props.highlightColor : this.props.highlightColor.bgColor}
          textDecorationLine={this.state.selected ? 'underline' : 'none'}
          lineHeight={this.props.lineHeight}
        >
          {this.props.defaultLang == 'en' ? '  ': ''}{`${this.props.verseItem.verse_nr}`}{'  '}
        </PharseNumber>
        {`${this.props.verseItem.verse}`}{this.props.defaultLang == 'cht_en' ? '\n' : ''}
      </PharseText>
    );
  }
}
