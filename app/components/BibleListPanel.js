import React, { Component, PureComponent } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
} from 'react-native';
import styled from "styled-components/native";
import Feather from 'react-native-vector-icons/Feather';
import * as R from 'ramda';

const StyledBookListTextView = styled.TouchableHighlight`
  display: flex;
  justify-content: center;
  align-items: center;
  width:52px;
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
  height: 30;
  background-color: #262626;
`;
//this.props.closeControlPanel()
export default class BibleListPanel extends Component {
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
  findChapterLength = (book_nr) => {
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    let bibleVersion = realm_bible_cht;
    if(this.props.defaultLang == 'cht') bibleVersion = realm_bible_cht;
    if(this.props.defaultLang == 'chs') bibleVersion = realm_bible_chs;
    if(this.props.defaultLang == 'en') bibleVersion = realm_bible_kjv;
    if(this.props.defaultLang == 'ja') bibleVersion = realm_bible_japan;
    const results = bibleVersion.filtered(`book_nr = ${book_nr}`);
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
  findVerseLength = (chapter_nr) => {
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    let bibleVersion = realm_bible_cht;
    if(this.props.defaultLang == 'cht') bibleVersion = realm_bible_cht;
    if(this.props.defaultLang == 'chs') bibleVersion = realm_bible_chs;
    if(this.props.defaultLang == 'en') bibleVersion = realm_bible_kjv;
    if(this.props.defaultLang == 'ja') bibleVersion = realm_bible_japan;
    const results = bibleVersion.filtered(`book_nr = ${this.state.book_nr} AND chapter_nr = ${chapter_nr}`);
    this.setState({
      chapter_nr: chapter_nr,
      verseLength: results.length,
      mode: 'verse',
      title: `${results[0].book_name} ${chapter_nr}`,
    });
  }
  goBible = (verse_nr) => {
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    let bibleVersion = realm_bible_cht;
    if(this.props.defaultLang == 'cht') bibleVersion = realm_bible_cht;
    if(this.props.defaultLang == 'chs') bibleVersion = realm_bible_chs;
    if(this.props.defaultLang == 'en') bibleVersion = realm_bible_kjv;
    if(this.props.defaultLang == 'ja') bibleVersion = realm_bible_japan;
    const results = bibleVersion.filtered(`book_nr = ${this.state.book_nr} AND chapter_nr = ${this.state.chapter_nr} AND verse_nr = ${verse_nr}`);
    this.setState({
      mode: 'book',
      title: 'Books',
    });
    this.props.closeControlPanel();
    alert(results[0].verse);
  }
  renderBooks = () => {
    const oldBooks = this.props.oldBooks.map((item, index) => 
    <StyledBookListTextView onPress={() => this.findChapterLength(index + 1)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <StyledBookListText>{item}</StyledBookListText>
      </StyledBookListTextView>
    );
    const newBooks = this.props.newBooks.map((item, index) => 
    <StyledBookListTextView onPress={() => this.findChapterLength(index + 1)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <StyledBookListText>{item}</StyledBookListText>
      </StyledBookListTextView>
    );
    return(
      <View>
        <View style={{padding:20, display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
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
            onPress={() => this.findVerseLength(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <StyledBookListText>{item}</StyledBookListText>
          </StyledBookListTextView>
        );
      })
    )(this.state.chapterLength);
    return(
      <View>
        <View style={{padding:20, display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
          {chapters}
        </View>
      </View>
    );
  }
  renderVerse = () => {
    const chapters = R.pipe(
      R.range(1),
      R.map((item) => {
        return (
          <StyledBookListTextView
            onPress={() => this.goBible(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <StyledBookListText>{item}</StyledBookListText>
          </StyledBookListTextView>
        );
      })
    )(this.state.verseLength);
    return(
      <View>
        <View style={{padding:20, display:'flex', flexWrap:'wrap', width:'100%', flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
          {chapters}
        </View>
      </View>
    );
  }
  render() {
    return (
      <ScrollView style={{flex:1, backgroundColor:'black'}}>
        <View style={{flex:1, padding:20, paddingBottom:0, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View><Text>{'      '}</Text></View>
          <Text style={{fontSize:24, fontWeight:'900',color:'#FCE6B0'}}>{this.state.title}</Text>
          <View>
            {this.state.mode == 'book' ?
              <TouchableHighlight onPress={() => this.props.closeControlPanel()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Feather
                  style={{marginTop:7,marginRight:15}}
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
                  style={{marginTop:7,marginRight:15}}
                  name='corner-up-left'
                  size={20}
                  color="#FCE6B0"
                />
              </TouchableHighlight>
            }
          </View>
        </View>
        {this.state.mode == 'book' ? this.renderBooks() : null}
        {this.state.mode == 'chapter'? this.renderChapters() : null}
        {this.state.mode == 'verse' ? this.renderVerse() : null}
      </ScrollView>
    )
  }
}
