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
} from 'react-native';
import * as R from 'ramda';
import moment from 'moment/min/moment-with-locales';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
import Spinner from 'react-native-spinkit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { bookName } from '../constants/bible';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');
import I18n from 'react-native-i18n';
import { quicksort } from '../api/utilities';

const StyledDiaryText = styled.View`
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
    this.state = {
      selectVerse: {},
      selectVerseNumberRef: {},
      selectVerseRef: {},
      lastPress: 0,
    }
    this.anchor = [];
  }
  _handleDoublePress = () => {
    var delta = new Date().getTime() - this.state.lastPress;
    if(delta < 300) {
      this.props.handleDoublePress();
    }
    this.setState({
      lastPress: new Date().getTime(),
    });
  }
  resetHighlight = () => {
    R.values(this.state.selectVerseNumberRef).map(item => item.setNativeProps({style:{color:this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
    R.values(this.state.selectVerseRef).map(item => item.setNativeProps({style:{color:this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
    this.setState({
      selectVerse: {},
      selectVerseRef: {},
      selectVerseNumberRef: {},
    });
  }
  setHighlight = async (color) => {
    try {
      const selectVerses = R.keys(this.state.selectVerse);
      const setColorList = selectVerses.reduce((acc, val) => {
        return {
          ...acc,
          [val]: color,
        };
      }, {});
      const highlightList = await global.storage.load({key:'@highlightList'});
      const _highlightList = {
        ...highlightList,
        ...setColorList,
      }
      await global.storage.save({key: '@highlightList', data: _highlightList, expires: null});
      R.values(this.state.selectVerseNumberRef).map(item => item.setNativeProps({style:{color:this.props.fontColor, backgroundColor:color,textDecorationLine:'none', textDecorationStyle:'dotted'}}));
      R.values(this.state.selectVerseRef).map(item => item.setNativeProps({style:{color:this.props.fontColor, backgroundColor:color, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
      this.resetHighlight();
    } catch(e) {
      alert(JSON.stringify(e));
    }
  }
  addBookmark = async (action) => {
    try {
      if (action) {
        const _bookmark = await global.storage.load({key:'@bookmark'});
        R.keys(this.state.selectVerse).map((keyId) => {
          delete _bookmark[keyId];
        });
        await global.storage.save({key: '@bookmark', data: _bookmark, expires: null});
      } else {
        const bookmark = await global.storage.load({key:'@bookmark'});
        const _bookmark = {
          ...bookmark,
          ...this.state.selectVerse,
        }
        await global.storage.save({key: '@bookmark', data: _bookmark, expires: null});
      }
      this.resetHighlight();
    } catch(e) {
      alert(JSON.stringify(e));
    }
  }
  checkBookmark = async () => {
    try {
      const bookmark = await global.storage.load({key:'@bookmark'});
      const matchFn = R.contains(R.__, R.keys(bookmark)); 
      const isMatch = R.all(matchFn)(R.keys(this.state.selectVerse));
      this.props.checkBookmark(isMatch);
    } catch(e) {
      alert(JSON.stringify(e));
    }
  }
  generateCopyText = () => {
    let c = 0;
    const verse = R.pipe(
      R.toPairs(),
      R.sort((a, b) => {
        let _a = a[0];
        let _b = b[0];
        _a = Number(_a.slice(0, _a.indexOf('-')));
        _b = Number(_b.slice(0, _b.indexOf('-')));
        return _a - _b;
        }
      ),
      R.fromPairs(),
      R.values(),
    )(this.state.selectVerse);
    const copy = verse.reduce((acc, val, i) => {
      let b = [];
      const previousVerse = verse[i - 1];
      if(i == 0){
        b.push(val);
        acc[c] = b;
        return acc;
      }
      if(previousVerse.book_name == val.book_name && previousVerse.chapter_nr == val.chapter_nr && previousVerse.verse_nr == val.verse_nr -1){
        acc[c].push(val);
        return [...acc];
      }
      ++c;
      b.push(val);
      acc[c] = b;
      return  [...acc];
    }, []);
    const copyText = copy.reduce((acc, val) => {
      let verseNumber = '';
      verseNumber = (val.length == 1) ? '' : '-' + (val[0].verse_nr + val.length - 1);
      for(let i = 0; i < val.length; i++){
        if(i == 0){
          acc = acc + val[0].book_name + val[0].chapter_nr + ':' + val[0].verse_nr + verseNumber + '  :『' + val[i].verse;
        } else {
          acc = acc  + val[i].verse;
        }
      }
      acc = acc + '』\n\n';
      return acc;
    }, '');
    return copyText;
  }
  copyVerse = () => {
    const copyText = this.generateCopyText();
    Clipboard.setString(copyText);
    this.resetHighlight();
  }
  renderTitle = () => {
    if(this.props.content.length == 0) return (
      <View style={{height:deviceHeight - 300, flex:1, flexDirection: 'column', justifyContent:'center', alignItems:'center'}}>
        <Text>Loading...</Text>
        <Spinner style={{marginTop:20}} size={70} type={'Wave'}></Spinner>
      </View>
    );
    const renderDay = () =>
      <View style={{borderLeftWidth:8, paddingLeft:10, borderColor:'red'}}>
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
            style={{height:40, display:'flex', justifyContent:'flex-end', borderBottomWidth: 1, borderBottomColor:'#0881A3', paddingBottom:1}}
            hitSlop={{top: 40, bottom: 40, left: 10, right: 10}}
            onPress={(e) => {
              this.props.closeActionButton();
              this[item[0].book_name + item[0].chapter_nr].measure((y, pageY) => {
                this.props.contentView.root.scrollTo({y: pageY + 100, animated: true});
              });
              const { realm, realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
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
          {'\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}:${item[0].verse_nr}-${item[0].verse_nr == '1' ? item.length : item[item.length -1].verse_nr}`}{this.props.defaultLang == 'cht_en' ? '': '\n'}
          </BookTitle>
        const Verse = () => item.map(verseItem => {
          return(
            <Text
              key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`}
              onPress={(e) => {
                const delta = new Date().getTime() - this.state.lastPress;
                if(delta < 300) {
                  if(this.props.isTooltipModalVisible){
                    setTimeout(() => {
                      this.props.handleDoublePress();
                      this.props.handleDoublePress();
                    }, 0);
                  }
                }
                const key = `${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`;
                const keyId = `${verseItem.id}-${verseItem.version}`;
                if(this.state.selectVerse.hasOwnProperty(keyId)) {
                  this[verseItem.version + item[0].book_name + item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}});
                  this['number' + verseItem.version + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:this.props.fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}});
                  delete this.state.selectVerse[keyId];
                  delete this.state.selectVerseRef[key];
                  delete this.state.selectVerseNumberRef['number' + key];
                  this.setState({
                    selectVerse: {...this.state.selectVerse},
                    selectVerseRef: {...this.state.selectVerseRef},
                    selectVerseNumberRef: {...this.state.selectVerseNumberRef},
                    lastPress: new Date().getTime(),
                  })
                } else {
                  this[verseItem.version + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:'#CF1B1B', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                  this['number' + verseItem.version + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:'#CF1B1B', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                  this.setState({
                    selectVerse: {...this.state.selectVerse, [keyId]:{...verseItem, keyId: keyId, createdTime: moment().format('YYYY-MM-DD')}},
                    selectVerseRef: {...this.state.selectVerseRef, [key] : this[verseItem.version + item[0].book_name + item[0].chapter_nr + verseItem.verse_nr]},
                    selectVerseNumberRef: {...this.state.selectVerseNumberRef, ['number' + key]: this['number' + verseItem.version + item[0].book_name + item[0].chapter_nr + verseItem.verse_nr]},
                    lastPress: new Date().getTime(),
                  });
                }
                this.checkBookmark();
                if(R.isEmpty(this.state.selectVerse)) this.props.toggleModalTooltip();
              }}
              ref={ r => this[verseItem.version + item[0].book_name + item[0].chapter_nr + verseItem.verse_nr] = r}
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
                ref={ r => this['number' + verseItem.version + item[0].book_name +item[0].chapter_nr + verseItem.verse_nr] = r}
              >
                {this.props.defaultLang == 'cht_en' ? '\n': ''}{`${verseItem.verse_nr}`}{'  '}
              </PharseNumber>
              {`${verseItem.verse}`}{this.props.defaultLang == 'cht_en' ? '\n' : ''}
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
      <Text style={{fontFamily:this.props.fontFamily}}>{I18n.t('finishe_today')}</Text>
      </View> :
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:300, marginTop:50}}>
        <Text style={{fontFamily:this.props.fontFamily}}>{I18n.t('pull_down_to_finish')}</Text>
        <MaterialCommunityIcons
          style={{marginTop:20}}
          name='arrow-expand-up'
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
