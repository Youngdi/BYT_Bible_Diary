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
  Button,
  Clipboard,
  FlatList,
} from 'react-native';
import * as R from 'ramda';
import moment from 'moment/min/moment-with-locales';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { bookName } from '../constants/bible';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');
import I18n from 'react-native-i18n';
import { quicksort } from '../api/utilities';

const StyledMainContainer = styled.View`
  margin-left:30px;
  margin-right:30px;
`;
const StyledBibleContainer = styled.View`
  margin-left:30px;
  margin-right:30px;
`;
const Title = styled.Text`
  height: 23px;
  font-weight: bold;
  font-size: 20px;
  color: ${props => props.fontColor};
  line-height: 28;
  font-family: ${props => props.fontFamily};
`;
const BookTitle = styled.Text`
  font-weight: 800;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  margin-bottom:10px;
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

export default class DiaryContent extends PureComponent {
  constructor(props) {
    super(props);
  }
  renderDiaryTitle = () => {
    const renderDay = () =>
      <View style={{borderLeftWidth:8, paddingLeft:10, borderColor: this.props.marked ? '#F7B633' : '#CF0A2C'}}>
        <Title 
          fontColor={this.props.fontColor}
          fontFamily={this.props.fontFamily}
        >
        {`${this.props.date.month}${I18n.t('month')}${this.props.date.day}${I18n.t('day')}`}
        </Title>
      </View>
    const renderAnchor = () =>
      this.props.content.map( (item, i) => {
        return(
          <TouchableOpacity
            key={`${item[0].version}-${item[0].book_name_short}${item[0].chapter_nr}`}
            style={{height:40, display:'flex', justifyContent:'flex-end', borderBottomWidth: 1, borderBottomColor:'#0881A3', paddingBottom:1}}
            hitSlop={{top: 40, bottom: 40, left: 10, right: 10}}
            onPress={(e) => {
              this.props.closeActionButton();
              this[item[0].book_name + item[0].chapter_nr].measure((y, pageY) => {
                this.props.contentView.root.scrollTo({y: pageY, animated: true});
                this.props.setFullScreenMode();
              });
            }}
          >
            <Text style={{fontSize:12, color: '#0881A3'}}>
              {`${item[0].book_name_short}${item[0].chapter_nr}`}
            </Text>
          </TouchableOpacity>
        );
      })
    return (
      <View style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between', marginTop:20}}>
        {renderDay()}
        {renderAnchor()}
      </View>
    );
  }
  renderItem = (item, i) => {
    return (
      <View>
        <BookTitle
          fontSize={this.props.fontSize + 2}
          fontColor={this.props.fontColor}
          lineHeight={this.props.lineHeight}
          fontFamily={this.props.fontFamily}
        >
        {i ? '': '\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}:${item[0].verse_nr}-${item.length == 1 ? '' : item[item.length -1].verse_nr}`}
        </BookTitle>
        <PharseCantainer
          fontSize={this.props.fontSize}
          fontColor={this.props.fontColor}
          lineHeight={this.props.lineHeight}
          fontFamily={this.props.fontFamily}
        >
        {item.map(verseItem => {
          return(
            <Text
              key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`}
              onPress={(e) => this.props.handleVerseClick(verseItem)}
              ref={ r => this[verseItem.version + verseItem.book_name + verseItem.chapter_nr + verseItem.verse_nr] = r}
              style={{
                color: this.props.fontColor,
                backgroundColor: this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.highlightList[`${verseItem.id}-${verseItem.version}`] : 'transparent'
              }}
            >
              <PharseNumber
                key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}-number`}
                style={{
                  color: this.props.fontColor, // this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.readingMode ? '#ccc' : '#000': 'gray'
                  backgroundColor: this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.highlightList[`${verseItem.id}-${verseItem.version}`] : 'transparent'
                }}
                fontSize={this.props.fontSize - 6}
                ref={ r => this['number' + verseItem.version + verseItem.book_name +verseItem.chapter_nr + verseItem.verse_nr] = r}
              >
                {this.props.defaultLang == 'en' ? '  ': ''} {`${verseItem.verse_nr}.`}{'  '}
              </PharseNumber>
              {`${verseItem.verse}`}{this.props.defaultLang == 'cht_en' ? '\n' : ''}
            </Text>
          );
        })}
        </PharseCantainer>
      </View>
    );
  }
  renderDiaryVerse = () => this.props.content.map((item, i) =>
    <View ref={r => this[item[0].book_name + item[0].chapter_nr] = r}>
      <FlatList
        data={[item]}
        renderItem={({item}) => this.renderItem(item, i)}
        keyExtractor={(item, index) => index}
      />
    </View>
  );
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
              onPress={(e) => this.handleVerseClick(verseItem)}
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
  renderFinishText = () => {
    if(this.props.content.length == 0) return;
    return(
      this.props.marked ? 
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:100, marginTop:30}}>
        <Text style={{color:this.props.fontColor, fontFamily:this.props.fontFamily}}>{I18n.t('finishe_today')}</Text>
      </View> :
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:200, marginTop:30}}>
        <Text style={{color:this.props.fontColor, fontFamily:this.props.fontFamily}}>{I18n.t('pull_down_to_finish')}</Text>
        <MaterialCommunityIcons
          style={{marginTop:20}}
          name='arrow-expand-up'
          size={30}
          color={`${this.props.fontColor}`}
        />
      </View>
    );
  }
  renderDiary = () => {
    return (
      <StyledMainContainer>
        {this.renderDiaryTitle()}
        {this.renderDiaryVerse()}
        {this.renderFinishText()}
      </StyledMainContainer>
    )
  }
  renderBible = () => {
    return (
      <View style={{marginTop:20}}>
        <StyledMainContainer>
          {this.renderBibleVerse()}
        </StyledMainContainer>
      </View>
    )
  }
  render() {
    return (
      this.renderDiary()
    );
  }
}
