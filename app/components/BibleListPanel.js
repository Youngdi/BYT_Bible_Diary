import React, { Component, PureComponent } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Dimensions,
} from 'react-native';
import styled from "styled-components/native";
import Feather from 'react-native-vector-icons/Feather';
import { isIphoneX } from 'react-native-iphone-x-helper';
import * as R from 'ramda';
import { dbFindChapter, dbFindVerse } from '../api/api';
var {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const StyledBookListTextView = styled.TouchableHighlight`
  display: flex;
  justify-content: center;
  align-items: center;
  width:${deviceWidth / 6}px;
  height:45px;
  border-bottom-color: #373331;
  border-bottom-width:1px;
  padding:10px;
`;
const StyledBookListText = styled.Text`
  color: #FCE6B0;
`;
const StyledDivider = styled.View`
  width: 100%;
  height: 15px;
  background-color: #262626;
`;
const StyledTitleContainer = styled.View`
  flex:1;
  padding:20px;
  flex-direction:row;
  justify-content:space-between;
  align-items:center;
  margin-top:${isIphoneX() ? '16px' : '0px'};
`;
export default class BibleListPanel extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      chapterLength: 0,
      verseLength: 0,
      book_nr: 0,
      chapter_nr: 0,
      verse_nr:0,
      mode: 'book',
      title: 'Books',
    };
  }
  findChapterLength = async (book_nr) => {
    const results = await dbFindChapter(book_nr, this.props.defaultLang);
    const findLength = R.pipe(
      R.map(R.prop('chapter_nr')),
      R.uniq(),
      R.length(),
    )(results);
    this.setState({
      book_nr: book_nr,
      chapterLength: findLength,
      mode: 'chapter',
      title: results[0].book_name,
    });
  }
  findVerseLength = async (chapter_nr) => {
    const results = await dbFindVerse(this.state.book_nr, chapter_nr, this.props.defaultLang);
    this.setState({
      chapter_nr: chapter_nr,
      verseLength: results.length,
      mode: 'verse',
      title: `${results[0].book_name} ${chapter_nr}`,
    });
  }
  goBible = async (verse_nr) => {
    const setting = await global.storage.load({key: '@setting',});
    const results = await dbFindVerse(this.state.book_nr, this.state.chapter_nr, this.props.defaultLang);
    this.setState({
      mode: 'book',
      title: 'Books',
    });
    this.props.navigation.navigate('Bible', {
      book_nr: this.state.book_nr,
      chapter_nr: this.state.chapter_nr,
      verse_nr: verse_nr,
      title: `${results[0].book_name}${' '}${results[0].chapter_nr}`,
      lang: this.props.defaultLang,
      version: results[0].version,
      setting: setting,
      bg: setting.readingMode ? '#333' : '#fff',
    });
  }
  renderBooks = () => {
    const oldBooks = this.props.oldBooks.map((item, index) => 
    <StyledBookListTextView key={`${item}-${index}`} onPress={() => this.findChapterLength(index + 1)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <StyledBookListText>{item}</StyledBookListText>
      </StyledBookListTextView>
    );
    const newBooks = this.props.newBooks.map((item, index) => 
    <StyledBookListTextView key={`${item}-${index}`} onPress={() => this.findChapterLength((index + 1) + 39)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <StyledBookListText>{item}</StyledBookListText>
      </StyledBookListTextView>
    );
    return(
      <View style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <StyledDivider />
        <View style={{padding:20, paddingTop:0, display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
          {oldBooks}
        </View>
        <StyledDivider />
        <View style={{padding:20, paddingTop:0,display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
          {newBooks}
        </View>
      </View>
    );
  }
  renderChapters = () => {
    const chapters = R.pipe(
      R.range(1),
      R.map((item) => {
        return (
          <StyledBookListTextView
            key={`chapter-${item}`}
            onPress={() => this.findVerseLength(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <StyledBookListText>{item}</StyledBookListText>
          </StyledBookListTextView>
        );
      })
    )(this.state.chapterLength == 1 ? 2 : this.state.chapterLength + 1);
    return(
      <View style={{padding:20, paddingTop:0, display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
        {chapters}
      </View>
    );
  }
  renderVerse = () => {
    const chapters = R.pipe(
      R.range(1),
      R.map((item) => {
        return (
          <StyledBookListTextView
            key={`verse-${item}`}
            onPress={() => this.goBible(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <StyledBookListText>{item}</StyledBookListText>
          </StyledBookListTextView>
        );
      })
    )(this.state.verseLength == 1 ? 2 : this.state.verseLength + 1);
    return(
      <View style={{padding:20, paddingTop:0, display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
        {chapters}
      </View>
    );
  }
  render() {
    return (
      <ScrollView style={{flex:1, backgroundColor:'#1E1E1E'}}>
        <StyledTitleContainer>
          <View><Text>{'           '}</Text></View>
          <View>
            <Text style={{fontSize:24, fontWeight:'900',color:'#FCE6B0'}}>
              {this.state.title}
            </Text>
          </View>
          <View>
            {this.state.mode == 'book' ?
              <TouchableHighlight onPress={() => this.props.closeControlPanel()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Feather
                  style={{marginTop:7,marginRight:25}}
                  name='x-circle'
                  size={20}
                  color="#FCE6B0"
                />
              </TouchableHighlight>
              :
              <TouchableHighlight
                onPress={() => {
                  let mode;
                  let title;
                  let dropIndex = 1;
                  if(this.state.chapterLength > 9 && this.state.chapterLength < 99) dropIndex = 2;
                  if(this.state.chapterLength > 99) dropIndex = 3;
                  if(this.state.mode == 'chapter') {
                    mode = 'book';
                    title = 'Books';
                  }
                  if(this.state.mode == 'verse') {
                    mode = 'chapter';
                    title = R.dropLast(dropIndex, this.state.title);
                  }
                  this.setState({
                    mode: mode,
                    title: title,
                  });
                }}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Feather
                  style={{marginTop:7,marginRight:25}}
                  name='corner-up-left'
                  size={20}
                  color="#FCE6B0"
                />
              </TouchableHighlight>
            }
          </View>
        </StyledTitleContainer>
        {this.state.mode == 'book' ? this.renderBooks() : null}
        {this.state.mode == 'chapter'? this.renderChapters() : null}
        {this.state.mode == 'verse' ? this.renderVerse() : null}
      </ScrollView>
    )
  }
}
