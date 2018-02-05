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
      headerTintColor: '#333',
      title: <StyledHeaderTitle>{state.params.title}</StyledHeaderTitle>,
      gesturesEnabled: true,
      headerLeft: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => navigation.goBack()}
                   >
                    <Ionicons style={{marginLeft:15}} name='ios-arrow-back-outline' size={30} color='#333' />
                  </TouchableOpacity>
      ,headerRight: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => navigation.navigate('BibleSearch', {lang: state.params.lang})}
                  >
                    <Ionicons style={{marginRight:15}} name='ios-search-outline' size={25} color='#333' />
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
      bookmarkIsMatch: false,
      lang:'cht',
      bg: '#fff',
      highlightList: [],
      selectVerse: {},
      selectVerseNumberRef: {},
      selectVerseRef: {},
      lastPress: 0,
      lastPress1: 0,
      content: [],
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
    this.setState({
      lang: this.props.navigation.state.params.lang,
      bg: BgColor,
      setting:{
        ...this.state.setting,
        ...setting,
        brightnessValue: brightness,
        fontColor: FontColor,
      },
      highlightList: highlightList,
      content: this.props.navigation.state.params.content,
      verse_nr: this.props.navigation.state.params.verse_nr,
    });
    setTimeout(() => {
      const wordNumbers = R.pipe(
        R.map(R.prop('verse')),
        R.map(R.length),
        R.reduce(R.add, 0)
      )(this.props.navigation.state.params.content[0]);
      const targetVerse = R.pipe(
        R.filter((item) => item.verse_nr < this.props.navigation.state.params.verse_nr),
        R.map(R.prop('verse')),
        R.map(R.length),
        R.reduce(R.add, 0)
      )(this.props.navigation.state.params.content[0]);
      const targetVerse1 = R.pipe(
        R.filter((item) => item.verse_nr == this.props.navigation.state.params.verse_nr),
        R.map(R.prop('verse')),
        R.map(R.length),
        R.reduce(R.add, 0)
      )(this.props.navigation.state.params.content[0]);
      const eachHeight = (this.state.pharseContainerHeight / wordNumbers * targetVerse + (targetVerse1 * 0.05)) - 70;
      if(this.props.navigation.state.params.verse_nr < 5) return;
      if(eachHeight > this.state.pharseContainerHeight - deviceHeight) {
        this.contentView.root.scrollToEnd();
      } else {
        this.contentView.root.scrollTo({y: eachHeight, animated: true});
      }
    }, 1500);
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
    if(this.state.content.length == 0) return;
    return (
      this.state.content.map( (item, i) => {
        const Verse = () => item.map(verseItem => {
          return(
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
  generateContent = async (action) => {
    const { book_nr, chapter_nr} = this.props.navigation.state.params.content[0][0];
    const verse_nr = this.props.navigation.state.params.verse_nr;
    const highlightList = await global.storage.load({key:'@highlightList'});
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    let bibleVersion = realm_bible_cht;
    if(this.state.lang == 'cht') bibleVersion = realm_bible_cht;
    if(this.state.lang == 'chs') bibleVersion = realm_bible_chs;
    if(this.state.lang == 'en') bibleVersion = realm_bible_kjv;
    if(this.state.lang == 'ja') bibleVersion = realm_bible_japan;
    const results = bibleVersion.filtered(`book_nr = ${book_nr} AND chapter_nr = ${chapter_nr + action}`);
    const content = results.sorted('verse_nr', false);
    this.setState({
      content: [content],
      highlightList: highlightList,
    });
    setTimeout(() => {
      this.setState({
        loadContent: false,
      });
    }, 500);
  }
  _handleNextDay = () => {
    this.resetHighlight();
    // this.closeActionButton();
    if(this.state.fullScreenMode) return null;
    if(this.state.loadContent) return null;
    this.setState({
      loadContent: true,
    });
    this.contentView.root.scrollTo({y: 10, animated: true});
    setTimeout(() => {
      this.generateContent(1);
    }, 0);
  }
  _handlePreviousDay = () => {
    // this.closeActionButton();
    if(this.state.fullScreenMode) return null;
    if(this.state.loadContent) return null;
    if(this.state.currentDate == '2018-01-01') {
      Alert.alert('去年已經不能回頭！');
      return null;
    }
    this.diaryContent.resetHighlight();
    const previousDate = moment(this.state.currentDate, "YYYY-MM-DD").add(-1, 'days').format("YYYY-MM-DD");
    const previousMonth = moment(this.state.currentDate, "YYYY-MM-DD").add(-1, 'days').format("M");
    const previousDay = moment(this.state.currentDate, "YYYY-MM-DD").add(-1, 'days').format("D");
    this.setState({
      date: {
        ...this.state.date,
        month: Number(previousMonth),
        day: Number(previousDay),
      },
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [previousDate]: {...this.state.markedDates[previousDate], selected: true},
      },
      currentDate: previousDate,
      finishedReading: false,
      loadContent: true,
    });
    this.contentView.root.scrollTo({y: 10, animated: true});
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  _handeleChangeLang = async (lang) => {
    // this.closeActionButton();
    if(this.state.loadContent) return null;
    if(lang == 'cht') I18n.locale = 'zh-hant';
    if(lang == 'chs') I18n.locale = 'zh-hans';
    if(lang == 'en') I18n.locale = 'en';
    if(lang == 'ja') I18n.locale = 'ja';
    if(lang == 'cht_en') I18n.locale = 'zh-hant';
    this.setState({
      defaultLang: lang,
    });
    if(lang == 'cht_en'){
      this.setState({content: []});
    } else {
      this.diaryContent.resetHighlight();
    }
    setTimeout(() => {
      this.generateContent();
    }, 0);
    await global.storage.save({
      key: '@lang',
      data: lang,
      expires: null,
    });
    this.generateBooks(lang);
  }
  _handleScroll = async (e) => {
    // this.closeActionButton();
    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
    const paddingToBottom = 20;
    const direction = contentOffset.y > this.state.scrollPosition ? 'down' : 'up';
    if(this.state.isTooltipModalVisible) return;
    if(contentOffset.y < 200) this.setState({fullScreenMode: false});
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
          handleNextDay={this._handleNextDay}
          handlePreviousDay={this._handlePreviousDay}
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
      </StyledContainer>
    );
  }
}
