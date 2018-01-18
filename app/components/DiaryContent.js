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
  ActivityIndicator,
} from 'react-native';
import * as R from 'ramda';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
import ReactNativeComponentTree from 'react-native/Libraries/Renderer/shims/ReactNativeComponentTree';
import Spinner from 'react-native-spinkit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { bookName } from '../constants/bible';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');
import { quicksort } from '../api/utilities';

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
const PharseCantainer = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  font-weight: 300;
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: gray;
  margin-top: -10px;
  margin-right: 5px;
`;

export default class DiaryContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectVerse: {},
      selectVerseNumberRef: {},
      selectVerseRef: {},
    }
    this.anchor = [];
  }
  renderTitle = () => {
    if(this.props.content.length == 0) return (
      <View style={{height:deviceHeight - 300, flex:1, flexDirection: 'column', justifyContent:'center', alignItems:'center'}}>
        <Text>讀取中...</Text>
        <Spinner style={{marginTop:20}} size={70} type={'Wave'}></Spinner>
      </View>
    );
    const renderDay = () => 
      <Title 
        fontColor={this.props.fontColor}
        lineHeight={this.props.lineHeight}
        fontFamily={this.props.fontFamily}
        fontSize={this.props.fontSize + 6}
      >
      {`${this.props.date.month}月${this.props.date.day}日`}
      </Title>
    const renderAnchor = () =>
      this.props.content.map( (item, i) => {
        return(
          <TouchableOpacity
            onPress={(e) => {
              R.values(this.state.selectVerseNumberRef).map(item => item.setNativeProps({style:{color: this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
              R.values(this.state.selectVerseRef).map(item => item.setNativeProps({style:{color: this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
              this[item[0].book_name + item[0].chapter_nr].measure((y, pageY) => {
                this.props.contentView.root.scrollTo({y: pageY + 100, animated: true})
              });
              this.setState({
                selectVerse: {},
                selectVerseRef: {},
                selectVerseNumberRef: {},
              });
            }}
          >
            <Text style={{fontSize:12, color: '#0881A3', textDecorationLine:'underline'}}>
              {`${item[0].book_name_short}${item[0].chapter_nr}`}
            </Text>
          </TouchableOpacity>
        );
      })
    return (
      <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:20}}>
        {renderDay()}
        {renderAnchor()}
      </View>
    );
  }
  renderVerse = () => {
    if(this.props.content.length == 0) return;
    return (
      this.props.content.map( (item, i) => {
        const Title = () =>
          <BookTitle
            fontSize={this.props.fontSize + 2}
            fontColor={this.props.fontColor}
            lineHeight={this.props.lineHeight}
            fontFamily={this.props.fontFamily}
          >
          {'\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}章${item[0].verse_nr}-${item[0].verse_nr == '1' ? item.length : item[item.length -1].verse_nr}節`}{'\n'}
          </BookTitle>
        const Verse = () => item.map(verseItem => {
          return(
            <Text 
              onPress={(e) => {
                const key = `${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`;
                if(this.state.selectVerse.hasOwnProperty(key)) {
                  this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color: this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}});
                  this['number' + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color: this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}});
                  delete this.state.selectVerse[key];
                  delete this.state.selectVerseRef[key];
                  delete this.state.selectVerseNumberRef['number' + key];
                  this.setState({
                    selectVerse: {...this.state.selectVerse},
                    selectVerseRef: {...this.state.selectVerseRef},
                    selectVerseNumberRef: {...this.state.selectVerseNumberRef}
                  })
                } else {
                  this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color: '#BB0029', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                  this['number' + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color: '#BB0029', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                  this.setState({
                    selectVerse: {...this.state.selectVerse, [key]:verseItem},
                    selectVerseRef: {...this.state.selectVerseRef, [key] : this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr]},
                    selectVerseNumberRef: {...this.state.selectVerseNumberRef, ['number' + key]: this['number' + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr]}
                  });
                }
              }}
              ref={ r => this[item[0].book_name +item[0].chapter_nr + verseItem.verse_nr] = r}
            >
              <PharseNumber
                fontSize={this.props.fontSize - 6}
                ref={ r => this['number' + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr] = r}
              >
                {`${verseItem.verse_nr}`}{'  '}
              </PharseNumber>
            {`${verseItem.verse}`}
            </Text>
        )});
        return (
          <View
            ref={r => this[item[0].book_name + item[0].chapter_nr] = r}
          >
            {Title()}
            <PharseCantainer
              fontSize={this.props.fontSize}
              fontColor={this.props.fontColor}
              lineHeight={this.props.lineHeight}
              fontFamily={this.props.fontFamily}
            >
            {Verse()}
            </PharseCantainer>
          </View> 
         );
      })
    );
  }
  renderFinishText = () => {
    if(this.props.content.length == 0) return;
    return(
      this.props.marked ? 
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:100, marginTop:30}}>
      <Text style={{fontFamily:this.props.fontFamily}}>今天進度已經完成囉！</Text>
      </View> :
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:300, marginTop:50}}>
        <Text style={{fontFamily:this.props.fontFamily}}>用力往下拉來完成今天進度</Text>
        <MaterialCommunityIcons
          style={{marginTop:20}}
          name='arrow-expand-down'
          size={30}
          color='#000'
        />
      </View>
    );
  }
  render() {
    return (
      <StyledDiaryText>
        {this.renderTitle()}
        {this.renderVerse()}
        {this.renderFinishText()}
      </StyledDiaryText>
    );
  }
}