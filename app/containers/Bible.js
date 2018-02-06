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
  Share,
  Alert,
} from 'react-native';
import * as R from 'ramda';
import moment from 'moment/min/moment-with-locales';
import styled from "styled-components/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenBrightness from 'react-native-screen-brightness';
import { bookName } from '../constants/bible';
import { isIphoneX } from 'react-native-iphone-x-helper';
import Footer from '../components/Footer';
import FontPanel from '../components/FontPanel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Tooltip from '../components/Tooltip';
import Pupup from '../components/Popup';
import bibleFlag from '../constants/bible';
import FontPanelModal from '../components/FontPanel';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');
import I18n from 'react-native-i18n';
import { quicksort } from '../api/utilities';

const StyledContainer = styled.View`
  flex: 1;
  background-color: ${props => props.bg};
`;
const StyledBibleContainer = styled.View`
  margin-left:30px;
  margin-right:30px;
`;
const StyledHeaderTitle = styled.Text`
  font-size:20;
  font-family: 'Times New Roman';
  font-weight: 900;
  color: ${props => props.color};
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
  padding-Bottom: 80px;
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  margin-top: -10px;
  margin-right: 5px;
`;
const StyledMain = styled.ScrollView`
  display:flex;
  background-color: ${props => props.bg};
`;

const StyledMainContent = styled.TouchableWithoutFeedback`
  background-color: ${props => props.bg};
`;
export default class Bible extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      headerStyle: {
        backgroundColor: state.params.bg,
      },
      title: <StyledHeaderTitle color={state.params.setting.fontColor}>{state.params.title}</StyledHeaderTitle>,
      gesturesEnabled: true,
      headerLeft: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => navigation.goBack()}
                   >
                    <Ionicons style={{marginLeft:15}} name='ios-arrow-back-outline' size={30} color={state.params.setting.fontColor} />
                  </TouchableOpacity>
      ,headerRight: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => navigation.navigate('BibleSearch', {lang: state.params.lang, setting:state.params.setting, bg:state.params.bg})}
                  >
                    <Ionicons style={{marginRight:15}} name='ios-search-outline' size={25} color={state.params.setting.fontColor} />
                  </TouchableOpacity>
    };
  };
  
  constructor(props) {
    super(props);
    this.state = {
      loadContent: false,
      fullScreenMode: false,
      popupText: '',
      isTooltipModalVisible: false,
      isFontSettingModalVisible: false,
      bookmarkIsMatch: false,
      lang: 'cht',
      bg: '#fff',
      highlightList: [],
      selectVerse: {},
      selectVerseNumberRef: {},
      selectVerseRef: {},
      lastPress: 0,
      lastPress1: 0,
      content: [[]],
      book_name: '',
      book_nr: 0,
      chapter_nr: 0,
      verse_nr: 0,
      setting: {
        fontFamily: 'Avenir',
        fontSize: 18,
        fontColor: '#000',
        lineHeight: 28,
        brightnessValue: 1,
        readingMode: false, // 0 -> day, 1 -> night
      },
      pharseContainerHeight: 0,
    }
    this.initData();
  }
  initData = async () => {
    const highlightList = await global.storage.load({key:'@highlightList'});
    const setting = await global.storage.load({key:'@setting'});
    const brightness = await ScreenBrightness.getBrightness();
    const FontColor = setting.readingMode ? '#ccc' : '#000';
    const BgColor = setting.readingMode ? '#333' : '#fff';
    await this.setState({
      lang: this.props.navigation.state.params.lang,
      bg: BgColor,
      setting:{
        ...this.state.setting,
        ...setting,
        brightnessValue: brightness,
        fontColor: FontColor,
      },
      highlightList: highlightList,
      verse_nr: this.props.navigation.state.params.verse_nr,
      chapter_nr: this.props.navigation.state.params.chapter_nr,
      book_nr: this.props.navigation.state.params.book_nr,
      chapterLength: this.props.navigation.state.params.chapterLength,
      version: this.props.navigation.state.params.version,
    });
    await this.generateContent();
    this.props.navigation.setParams({
      setting: this.state.setting,
      bg: BgColor,
    });
    setTimeout(() => {
      const wordNumbers = R.pipe(
        R.map(R.prop('verse')),
        R.map(R.length),
        R.reduce(R.add, 0)
      )(this.state.content[0]);
      const targetVerse = R.pipe(
        R.filter((item) => item.verse_nr < this.props.navigation.state.params.verse_nr),
        R.map(R.prop('verse')),
        R.map(R.length),
        R.reduce(R.add, 0)
      )(this.state.content[0]);
      const targetVerse1 = R.pipe(
        R.filter((item) => item.verse_nr == this.props.navigation.state.params.verse_nr),
        R.map(R.prop('verse')),
        R.map(R.length),
        R.reduce(R.add, 0)
      )(this.state.content[0]);
      const eachHeight = (this.state.pharseContainerHeight / wordNumbers * targetVerse + (targetVerse1 * 0.05)) - 70;
      if(this.props.navigation.state.params.verse_nr < 5) return;
      if(eachHeight > this.state.pharseContainerHeight - deviceHeight) {
        this.contentView.root.scrollToEnd();
      } else {
        this.contentView.root.scrollTo({y: eachHeight, animated: false});
      }
    }, 200);
  }
  handlelayout = (e) => {
    this.setState({
      pharseContainerWidth: e.nativeEvent.layout.width,
      pharseContainerHeight: e.nativeEvent.layout.height
    });
  } 
  closeHeaderActionButton = () => {

  }
  _handleDoublePress = () => {
    var delta = new Date().getTime() - this.state.lastPress;
    if(delta < 300) {
      this.setState({
        fullScreenMode: !this.state.fullScreenMode,
      });
      //this.closeActionButton();
    }
    //this.closeActionButton();
    this.setState({
      lastPress: new Date().getTime(),
    });
  }
  _handleHighlight = (color) => {
    this.setHighlight(color);
    this.setState({ isTooltipModalVisible: false });
  }
  _handleBookmark = () => {
    this.addBookmark(this.state.bookmarkIsMatch);
    this.setState({ isTooltipModalVisible: false, popupText: this.state.bookmarkIsMatch ? I18n.t('popup_bookmark_removed') : I18n.t('popup_bookmark_successed') });
    setTimeout(() => {
      this.pupupDialog.popup();
      }, 0);
  }
  _handleShare = async () => {
    const copyText = this.generateCopyText();
    const share = await Share.share({
      message: copyText,
      title: this.state.currentDate,
    });
    if(share.action == "sharedAction") {
      this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_share_successed') });
      this.resetHighlight();
      setTimeout(() => {
        this.pupupDialog.popup();
        }, 0);
    }
  }
  _handleCopyVerse = async () => {
    this.copyVerse();
    this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_copy_successed') });
    setTimeout(() => {
    this.pupupDialog.popup();
    }, 0);
  }
  _toggleModalTooltip = () => {
    // this.closeActionButton();
    this.setState({ isTooltipModalVisible: !this.state.isTooltipModalVisible });
  }
  _closeTooltip = () => {
    this.resetHighlight();
    this.setState({ isTooltipModalVisible: false });
  };
  _getDiaryBiblePhrase = () => {
    // this.closeActionButton();
    let number = Math.floor(Math.random() * 74) + 1;
    let bible_number = `B${number}`;
    Alert.alert(
    `每日一經文\n${bibleFlag[bible_number].chapter}`,
    `${bibleFlag[bible_number].verse}`,
    [
      {text: '確定', onPress: () => {}},
    ],
      { cancelable: false }
    );
  }
  resetHighlight = () => {
    const { fontColor } = this.state.setting;
    R.values(this.state.selectVerseNumberRef).map(item => item.setNativeProps({style:{color:fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
    R.values(this.state.selectVerseRef).map(item => item.setNativeProps({style:{color:fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
    this.setState({
      selectVerse: {},
      selectVerseRef: {},
      selectVerseNumberRef: {},
    });
  }
  setHighlight = async (color) => {
    const { fontColor } = this.state.setting;
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
      R.values(this.state.selectVerseNumberRef).map(item => item.setNativeProps({style:{color:fontColor, backgroundColor:color,textDecorationLine:'none', textDecorationStyle:'dotted'}}));
      R.values(this.state.selectVerseRef).map(item => item.setNativeProps({style:{color:fontColor, backgroundColor:color, textDecorationLine:'none', textDecorationStyle:'dotted'}}));
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
      this.setState({
        bookmarkIsMatch: isMatch,
      });
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
  renderVerse = () => {
    const {fontSize, lineHeight, fontColor, fontFamily} = this.state.setting;
    if(R.isEmpty(this.state.content[0])) return;
    return (
      this.state.content.map( (item, i) => {
        const Verse = () => item.map(verseItem => {
          return (
            <Text
              key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`}
              onPress={(e) => {
                const delta = new Date().getTime() - this.state.lastPress1;
                if(delta < 600) {
                  if(this.state.isTooltipModalVisible){
                    setTimeout(() => {
                      this._handleDoublePress();
                      this._handleDoublePress();
                    }, 0);
                  }
                }
                const key = `${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`;
                const keyId = `${verseItem.id}-${verseItem.version}`;
                if(this.state.selectVerse.hasOwnProperty(keyId)) {
                  this[verseItem.version + verseItem.book_name + verseItem.chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}});
                  this['number' + verseItem.version + verseItem.book_name +verseItem.chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:fontColor, textDecorationLine:'none', textDecorationStyle:'dotted'}});
                  delete this.state.selectVerse[keyId];
                  delete this.state.selectVerseRef[key];
                  delete this.state.selectVerseNumberRef['number' + key];
                  this.setState({
                    selectVerse: {...this.state.selectVerse},
                    selectVerseRef: {...this.state.selectVerseRef},
                    selectVerseNumberRef: {...this.state.selectVerseNumberRef},
                    lastPress1: new Date().getTime(),
                  });
                } else {
                  this[verseItem.version + verseItem.book_name +verseItem.chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:'#CF1B1B', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                  this['number' + verseItem.version + verseItem.book_name +verseItem.chapter_nr + verseItem.verse_nr].setNativeProps({style:{color:'#CF1B1B', textDecorationLine:'underline', textDecorationStyle:'dotted'}});
                  this.setState({
                    selectVerse: {...this.state.selectVerse, [keyId]:{...verseItem, keyId: keyId, createdTime: moment().format('YYYY-MM-DD')}},
                    selectVerseRef: {...this.state.selectVerseRef, [key] : this[verseItem.version + verseItem.book_name + verseItem.chapter_nr + verseItem.verse_nr]},
                    selectVerseNumberRef: {...this.state.selectVerseNumberRef, ['number' + key]: this['number' + verseItem.version + verseItem.book_name + verseItem.chapter_nr + verseItem.verse_nr]},
                    lastPress1: new Date().getTime(),
                  });
                }
                this.checkBookmark();
                if(R.isEmpty(this.state.selectVerse)) this._toggleModalTooltip();
              }}
              ref={ r => this[verseItem.version + verseItem.book_name + verseItem.chapter_nr + verseItem.verse_nr] = r}
              style={{
                color: fontColor,
                backgroundColor: this.state.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.state.highlightList[`${verseItem.id}-${verseItem.version}`] : 'transparent'
              }}
            >
              <PharseNumber
                key={`${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}-number`}
                style={{
                  color: fontColor, // this.props.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.props.readingMode ? '#ccc' : '#000': 'gray'
                  backgroundColor: this.state.highlightList.hasOwnProperty(`${verseItem.id}-${verseItem.version}`) ? this.state.highlightList[`${verseItem.id}-${verseItem.version}`] : 'transparent'
                }}
                fontSize={fontSize - 6}
                ref={ r => this['number' + verseItem.version + verseItem.book_name +verseItem.chapter_nr + verseItem.verse_nr] = r}
              >
              {this.state.lang == 'en' ? '  ': ''}{`${verseItem.verse_nr}`}{'  '}
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
  generateContent = async (chapter_index, book_nr_index = 0) => {
    const highlightList = await global.storage.load({key:'@highlightList'});
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    let bibleVersion = realm_bible_cht;
    if(this.state.lang == 'cht') bibleVersion = realm_bible_cht;
    if(this.state.lang == 'chs') bibleVersion = realm_bible_chs;
    if(this.state.lang == 'en') bibleVersion = realm_bible_kjv;
    if(this.state.lang == 'ja') bibleVersion = realm_bible_japan;
    const results = bibleVersion.filtered(`book_nr = ${this.state.book_nr} AND chapter_nr = ${this.state.chapter_nr}`);
    const content = results.sorted('verse_nr', false);
    const results_findLength = bibleVersion.filtered(`book_nr = ${this.state.book_nr}`);
    const length = R.pipe(
      R.map(R.prop('chapter_nr')),
      R.uniq(),
      R.length(),
    )(results_findLength);
    this.setState({
      content: [content],
      highlightList: highlightList,
      chapterLength: length,
      book_name: content[0].book_name,
    });
    setTimeout(() => {
      this.setState({
        loadContent: false,
      });
    }, 500);
    this.props.navigation.setParams({ title: `${content[0].book_name}${' '}${content[0].chapter_nr}`});
  }
  _handleNext = async () => {
    this.resetHighlight();
    if(this.state.chapterLength == this.state.chapter_nr){
      if(this.state.book_nr == 66) {
        await this.setState({
          chapter_nr: 1,
          book_nr: 1,
        });
      } else {
        await this.setState({
          chapter_nr: 1,
          book_nr: this.state.book_nr + 1,
        });
      }
    } else {
      await this.setState({
        chapter_nr: this.state.chapter_nr + 1,
      });
    }
    await this.generateContent();
  }
  _handlePrevious = async () => {
    this.resetHighlight();
    if(this.state.chapter_nr == 1){
      if(this.state.book_nr == 1) {
        const results_findLength = global.db.realm_bible_kjv.filtered(`book_nr = 66`);
        const length = R.pipe(
          R.map(R.prop('chapter_nr')),
          R.uniq(),
          R.length(),
        )(results_findLength);
        await this.setState({
          chapter_nr: length,
          book_nr: 66,
        });
      } else {
        const results_findLength = global.db.realm_bible_kjv.filtered(`book_nr = ${this.state.book_nr - 1}`);
        const length = R.pipe(
          R.map(R.prop('chapter_nr')),
          R.uniq(),
          R.length(),
        )(results_findLength);
        await this.setState({
          chapter_nr: length,
          book_nr: this.state.book_nr - 1,
        });
      }
    } else {
      await this.setState({
        chapter_nr: this.state.chapter_nr - 1,
      });
    }
    await this.generateContent();
  }
  _handeleChangeLang = async (lang) => {
    // this.closeActionButton();
    if(this.state.loadContent) return null;
    if(lang == 'cht') I18n.locale = 'zh-hant';
    if(lang == 'chs') I18n.locale = 'zh-hans';
    if(lang == 'en') I18n.locale = 'en';
    if(lang == 'ja') I18n.locale = 'ja';
    if(lang == 'cht_en') I18n.locale = 'zh-hant';
    await this.setState({
      lang: lang,
    });
    this.props.navigation.setParams({
      lang: lang,
    });
    if(lang == 'cht_en') {
      this.setState({content: [[]]});
    } else {
      this.resetHighlight();
    }
    // await global.storage.save({
    //   key: '@lang',
    //   data: lang,
    //   expires: null,
    // });
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  _handleScroll = async (e) => {
    // this.closeActionButton();
    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
    const paddingToBottom = 20;
    const direction = contentOffset.y > this.state.scrollPosition ? 'down' : 'up';
    if(this.state.isTooltipModalVisible) return;
    if(contentOffset.y < 200) this.setState({fullScreenMode: false});
  }
  _toggleModalFontSetting = () => {
    // this.closeActionButton();
    this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  }
  _handleSettingFontFamily = async (font) => {
    await this.setState({
      setting:{
        ...this.state.setting,
        fontFamily: font,
      },
    });
    await global.storage.save({
      key: '@setting',
      data: this.state.setting,
      expires: null,
    });
  }
  _handleSettingFontSize = async (value) => {
    if(this.state.setting.fontSize >= 28 && value == 2) return null;
    if(this.state.setting.fontSize <= 12 && value == -2) return null;
    await this.setState({
      setting:{
        ...this.state.setting,
        fontSize: this.state.setting.fontSize + value,
      },
    });
    await global.storage.save({
      key: '@setting',
      data: this.state.setting,
      expires: null,
    });
  }
  _handleSettingLineHeight = async (value) => {
    await this.setState({
      setting:{
        ...this.state.setting,
        lineHeight: value,
      },
    });
    await global.storage.save({
      key: '@setting',
      data: this.state.setting,
      expires: null,
    });
  }
  _handleSettingReadingMode = async () => {
    const FontColor = !this.state.setting.readingMode ? '#ccc' : '#000';
    const BgColor = !this.state.setting.readingMode ? '#333' : '#fff';
    await this.setState({
      bg: BgColor,
      setting:{
        ...this.state.setting,
        readingMode: !this.state.setting.readingMode,
        fontColor: FontColor,
      },
    });
    await global.storage.save({
      key: '@setting',
      data: this.state.setting,
      expires: null,
    });
    await this.props.navigation.setParams({
      setting:{
        ...this.state.setting,
        readingMode: !this.state.setting.readingMode,
        fontColor: FontColor,
      },
      bg: BgColor,
    });
  }
  _handleSliderValueChange = (value) => {
    ScreenBrightness.setBrightness(value);
    this.setState({
      setting:{
        ...this.state.setting,
        brightnessValue: value,
      }
    });
  }
  render() {
    return (
      <StyledContainer bg={this.state.bg}>
        <StyledMain
          ref={r => this.contentView = r}
          bg={this.state.bg} 
          onScroll={this._handleScroll.bind(this)}
          // onTouchStart={this._onMomentumScrollBegin.bind(this)}
          scrollEventThrottle={16}
          >
          <StyledMainContent
            bg={this.state.bg}
            onPress={this._handleDoublePress}
          >
            <View style={{marginTop:20}}>
              <StyledBibleContainer>
                {this.renderVerse()}
              </StyledBibleContainer>
            </View>
          </StyledMainContent>
        </StyledMain>
        <Footer
          handleNextDay={this._handleNext}
          handlePreviousDay={this._handlePrevious}
          handeleChangeLang={this._handeleChangeLang}
          defaultLang={this.state.lang}
          getDiaryBiblePhrase={this._getDiaryBiblePhrase}
          toggleModal={this._toggleModalFontSetting}
          fullScreenMode={this.state.fullScreenMode}
          content={[1,2]}
          closeHeaderActionButton={this.closeHeaderActionButton}
        />
        <Pupup text={this.state.popupText} ref={r => this.pupupDialog = r}/>
        <Tooltip
          isTooltipModalVisible={this.state.isTooltipModalVisible}
          toggleModalTooltip={this._toggleModalTooltip}
          closeTooltip={this._closeTooltip}
          handleHighlight={this._handleHighlight}
          handleBookmark={this._handleBookmark}
          handleCopyVerse={this._handleCopyVerse}
          handleShare={this._handleShare}
          bookmarkIsMatch={this.state.bookmarkIsMatch}
        />
        <FontPanelModal
          isFontSettingModalVisible={this.state.isFontSettingModalVisible}
          toggleModalFontSetting={this._toggleModalFontSetting}
          handleSettingFontFamily={this._handleSettingFontFamily}
          handleSettingFontSize={this._handleSettingFontSize}
          handleSettingLineHeight={this._handleSettingLineHeight}
          handleSettingReadingMode={this._handleSettingReadingMode}
          handleSliderValueChange={this._handleSliderValueChange}
          setting={this.state.setting}
        />
      </StyledContainer>
    );
  }
}
