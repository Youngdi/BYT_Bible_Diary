import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  Button,
  Share,
  AsyncStorage,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Spinner from 'react-native-spinkit';
import Drawer from 'react-native-drawer'
import Storage from 'react-native-storage';
import moment from 'moment/min/moment-with-locales';
import ScreenBrightness from 'react-native-screen-brightness';
import { isIphoneX } from 'react-native-iphone-x-helper';
import styled from "styled-components/native";
import I18n, { getLanguages } from 'react-native-i18n';
import * as R from 'ramda';
import Pupup from '../components/Popup';
import bibleFlag from '../constants/bible';
import { bookName } from '../constants/bibleBookList';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CalendarModal from '../components/Calendar';
import FontPanelModal from '../components/FontPanel';
import DiaryContent from '../components/DiaryContent';
import ArrowUp from '../components/ArrowUp';
import Check from '../components/Check';
import Tooltip from '../components/Tooltip';
import BibleListPanel from '../components/BibleListPanel';
import { dbFindDiary } from '../api/api';
import { copyVerse, setHighlight, addBookmark, checkBookmark } from '../api/tooltip';

const storage = new Storage({
	size: 1000,
	storageBackend: AsyncStorage,
	defaultExpires: null,
	enableCache: true,
});
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

global.storage = storage;
const StyledMain = styled.ScrollView`
  display:flex;
  background-color: ${props => props.bg};
  margin-top: ${isIphoneX() ? 33 : 22}px;
`;
const StyledMainContent = styled.TouchableWithoutFeedback`
  background-color: ${props => props.bg};
`;
const StyledContainer = styled.View`
  flex: 1;
  background-color: ${props => props.bg};
`;

I18n.fallbacks = true
// Available languages
I18n.translations = {
  'zh-Hant-TW': require('../translations/cht'),
  'zh-hant': require('../translations/cht'),
  'zh-TW': require('../translations/cht'),
  'zh-hans': require('../translations/chs'),
  'en': require('../translations/en'),
  'en-US': require('../translations/en'),
  'ja': require('../translations/ja'),
};
export default class DiaryRead extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      header: null,
      gesturesEnabled: false,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      arrowUpScrollY: new Animated.Value(0),
      footerScrollY: new Animated.Value(0),
      headerScrollY: new Animated.Value(0),
      fadeInOpacity: new Animated.Value(1),
      arrowFadeInOpacity: new Animated.Value(0),
      oldBooks: [],
      newBooks: [],
      content: [],
      popupText: '',
      defaultLang: 'cht',
      lastPress: 0,
      lastPress1: 0,
      bg: '#fff',
      fullScreenMode: false,
      isCalendarModalVisible: false,
      isFontSettingModalVisible: false,
      isTooltipModalVisible: false,
      finishedReading: false,
      loadContent: false,
      bookmarkIsMatch: false,
      scrollPosition: 0,
      hasRead: 0,
      setting: {
        fontFamily: 'Avenir',
        fontSize: 18,
        fontColor: '#000',
        lineHeight: 28,
        brightnessValue: 1,
        readingMode: false, // 0 -> day, 1 -> night
      },
      markedDates: {
        [moment().format('YYYY-MM-DD')]: {selected: true},
      },
      date: {
        dateString: moment().format('YYYY-MM-DD'),
        day:  Number(moment().format('D')),
        month: Number(moment().format('M')),
        year: Number(moment().format('YYYY')),
      },
      currentDate: moment().format('YYYY-MM-DD'),
      contentView:{},
      highlightList: {},
      selectVerse: {},
      selectVerseNumberRef: {},
      selectVerseRef: {},
    };
    this.initData();
  }
  initData = async () => {
      try {
        const readingRecord = await global.storage.load({key:'@readingSchdule'});
        const setting = await global.storage.load({key:'@setting'});
        const lang = await global.storage.load({key:'@lang'});
        const brightness = await ScreenBrightness.getBrightness();
        const FontColor = setting.readingMode ? '#ccc' : '#000';
        const BgColor = setting.readingMode ? '#333' : '#fff';
        if(lang == 'cht') I18n.locale = 'zh-hant';
        if(lang == 'chs') I18n.locale = 'zh-hans';
        if(lang == 'en') I18n.locale = 'en';
        if(lang == 'ja') I18n.locale = 'ja';
        if(lang == 'cht_en') I18n.locale = 'zh-hant';
        await this.setState({
          defaultLang: lang,
        });
        await this.generateContent();
        await this.generateBooks(lang);
        this.setState({
          contentView: this.contentView,
          bg: BgColor,
          setting:{
            ...this.state.setting,
            ...setting,
            brightnessValue: brightness,
            fontColor: FontColor,
          },
          markedDates: {
            ...readingRecord,
            [this.state.date.dateString]: {
              selected: true,
              marked: R.path([`${this.state.date.dateString}`, 'marked'], readingRecord) ? true : false,
            }
          },
        });
      } catch (err) {
        switch (err.name) {
          case 'NotFoundError':
            await global.storage.save({
              key: '@readingSchdule',
              data: {},
              expires: null,
            });
            await global.storage.save({
              key: '@highlightList',
              data: {},
              expires: null,
            });
            await global.storage.save({
              key: '@bookmark',
              data: {},
              expires: null,
            });
            await global.storage.save({
              key: '@setting',
              data: {
                fontFamily: 'Avenir',
                fontSize: 18,
                fontColor: '#000',
                lineHeight: 28,
                brightnessValue: 1,
                readingMode: false, // 0 -> day, 1 -> night
              },
              expires: null,
            });
            await global.storage.save({
              key: '@lang',
              data: 'cht',
              expires: null,
            });
            await global.storage.save({
              key: '@note',
              data: {},
              expires: null,
            });
            const readingRecord = await global.storage.load({key:'@readingSchdule'});
            await this.generateContent();
            await this.generateBooks('cht');
            await this.setState({
              contentView: this.contentView,
              markedDates: {
                ...readingRecord,
                [this.state.date.dateString]: {
                  selected : true,
                  marked: R.path([`${this.state.date.dateString}`, 'marked'], readingRecord) ? true : false,
                },
              },
            });
            break;
          case 'ExpiredError':
            break;
        }
      }
  }
  closeControlPanel = () => this._drawer.close()
  openControlPanel = () => this._drawer.open()
  setFullScreenMode = () => this.setState({fullScreenMode: true})
  closeHeaderActionButton = () => this.header.closeActionButton();
  closeFooterActionButton = () => this.footer.closeActionButton();
  reset = () => {
    this.closeTooltip();
    this.closeActionButton();
    this.contentView.root.scrollTo({y: 0, animated: false});
    this.setState({
      isCalendarModalVisible: false,
      fullScreenMode: false,
      isFontSettingModalVisible:false,
      highlightList: {},
      selectVerse: {},
      selectVerseNumberRef: {},
      selectVerseRef: {},
    });
  }
  closeActionButton = () => {
    if(this.header) this.header.closeActionButton();
    if(this.footer) this.footer.closeActionButton();
  }
  generateBooks = async (lang) => {
    const bookNameList = bookName[lang];
    this.setState({
      oldBooks: R.slice(0, 39 ,R.values(bookNameList)),
      newBooks: R.slice(39, 66, R.values(bookNameList)),
    });
  }
  generateContent = async () => {
    const highlightList = await global.storage.load({key:'@highlightList'});
    const content = await dbFindDiary(this.state.date, this.state.defaultLang);
    this.setState({
      content: content,
      highlightList: highlightList,
    });
    setTimeout(() => {
      this.setState({
        loadContent: false,
      });
    }, 500);
  }
  getDiaryBiblePhrase = () => {
    this.closeActionButton();
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
  toggleModalCalendar = () => {
    this.closeActionButton();
    this.state.fullScreenMode ? null : this.setState({ isCalendarModalVisible: !this.state.isCalendarModalVisible });
  }
  toggleModalTooltip = () => {
    this.closeActionButton();
    this.setState({ isTooltipModalVisible: !this.state.isTooltipModalVisible });
  }
  closeTooltip = () => {
    this.resetHighlight();
    this.setState({ isTooltipModalVisible: false });
  };
  toggleModalFontSetting = () => {
    this.closeActionButton();
    this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  }
  fullScreenAnimation = () => {
    this.state.fadeInOpacity.setValue(this.state.fullScreenMode ? 0 : 1);
    this.state.footerScrollY.setValue(this.state.fullScreenMode ? 50 : 0);
    this.state.headerScrollY.setValue(this.state.fullScreenMode ? -50 : 0);
    this.state.arrowFadeInOpacity.setValue(this.state.fullScreenMode ? 1 : 0);
    Animated.parallel([
      Animated.timing(this.state.fadeInOpacity, {
        toValue: this.state.fullScreenMode ? 1 : 0,
        duration: 500,
        easing: Easing.linear,
      }),
      Animated.timing(this.state.footerScrollY, {
        toValue: this.state.fullScreenMode ? 0 : 50,
        duration: 500,
        easing: Easing.linear,
      }),
      Animated.timing(this.state.headerScrollY, {
        toValue: this.state.fullScreenMode ? 0 : -50,
        duration: 500,
        easing: Easing.linear,
      }),
      Animated.timing(this.state.arrowFadeInOpacity, {
        toValue: this.state.fullScreenMode ? 0 : 1,
        duration: 500,
        easing: Easing.linear,
      })
    ]).start();
    this.closeActionButton();
    this.setState({
      fullScreenMode: !this.state.fullScreenMode,
    });
  }
  handleDoublePress = () => {
    var delta = new Date().getTime() - this.state.lastPress;
    if(delta < 300) {
      this.fullScreenAnimation();
    }
    this.closeActionButton();
    this.setState({
      lastPress: new Date().getTime(),
    });
  }
  _handleNextDay = () => {
    this.closeActionButton();
    if(this.state.fullScreenMode) return null;
    if(this.state.loadContent) return null;
    if(this.state.currentDate == '2018-12-31') {
      Alert.alert('今年還沒過完呢！');
      return null;
    }
    const nextDate = moment(this.state.currentDate, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD");
    const nextMonth = moment(this.state.currentDate, "YYYY-MM-DD").add(1, 'days').format("M");
    const nextDay = moment(this.state.currentDate, "YYYY-MM-DD").add(1, 'days').format("D");
    this.setState({
      date: {
        ...this.state.date,
        month: Number(nextMonth),
        day: Number(nextDay),
      },
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [nextDate]: {...this.state.markedDates[nextDate], selected: true},
      },
      currentDate: nextDate,
      finishedReading: false,
      loadContent: true,
    });
    this.contentView.root.scrollTo({y: 0, animated: true});
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  _handlePreviousDay = () => {
    this.closeActionButton();
    if(this.state.fullScreenMode) return null;
    if(this.state.loadContent) return null;
    if(this.state.currentDate == '2018-01-01') {
      Alert.alert('去年已經不能回頭！');
      return null;
    }
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
    this.contentView.root.scrollTo({y: 0, animated: true});
    setTimeout(() => {
      this.generateContent();
    }, 0);
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
  _handleChangeDay = async (day) => {
    this.closeActionButton();
    await this.setState({
      isCalendarModalVisible: !this.state.isCalendarModalVisible,
      date: day,
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [day.dateString]: {...this.state.markedDates[day.dateString], selected: true},
      },
      currentDate: day.dateString,
      finishedReading: false,
      isTooltipModalVisible: false,
    });
    this.contentView.root.scrollTo({y: 0, animated: true});
    this.resetHighlight();
    setTimeout( () => {
      this.generateContent();
    }, 10);
  }
  _handleMonthChange = (month) => {
    if(month.year > 2018) {
      this.toggleModalCalendar();
      setTimeout(() => Alert.alert(I18n.t('move_to_next_year')), 1000);
    }
    if(month.year < 2018) {
      this.toggleModalCalendar();
      setTimeout(() => Alert.alert(I18n.t('move_to_previous_year')), 1000);
    }
  }
  _handeleScrollTop = (e) => {
    this.closeActionButton();
    if(!this.state.fullScreenMode) return null;
    this.contentView.root.scrollTo({y: 0, animated: true});
  }
  _handleFinished = () => {
    this.setState({
      finishedReading: false,
      fullScreenMode: true,
    });
  }
  _handeleChangeLang = async (lang) => {
    if(this.state.loadContent) return null;
    if(lang == 'cht') I18n.locale = 'zh-hant';
    if(lang == 'chs') I18n.locale = 'zh-hans';
    if(lang == 'en') I18n.locale = 'en';
    if(lang == 'ja') I18n.locale = 'ja';
    if(lang == 'cht_en') I18n.locale = 'zh-hant';
    await this.setState({
      defaultLang: lang,
    });
    await global.storage.save({
      key: '@lang',
      data: lang,
      expires: null,
    });
    setTimeout(() => {
      this.generateContent();
    }, 200);
    setTimeout(() => {
      this.generateBooks(lang);
    }, 1500);
  }
  handleCheckBookmark = async () => {
    const isMatch = await checkBookmark(this.state.selectVerse);
    this.setState({bookmarkIsMatch : isMatch});
  }
  handleHighlight = async (color) => {
    const highlightList = await setHighlight({
      color,
      fontColor: this.state.setting.fontColor,
      selectVerse: this.state.selectVerse,
    });
    this.setState({ isTooltipModalVisible: false,  highlightList});
    this.resetHighlight();
  }
  handleBookmark = async () => {
    addBookmark(this.state.bookmarkIsMatch, this.state.selectVerse);
    this.setState({ isTooltipModalVisible: false, popupText: this.state.bookmarkIsMatch ? I18n.t('popup_bookmark_removed') : I18n.t('popup_bookmark_successed') });
    setTimeout(() => {
      this.pupupDialog.popup();
      }, 0);
    this.resetHighlight();    
  }
  handleShare = async (selectVerse) => {
    const copyText = await copyVerse(this.state.selectVerse);
    const share = await Share.share({
      message: copyText,
      title: this.state.currentDate,
    });
    if(share.action == "sharedAction") {
      this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_share_successed') });
      setTimeout(() => {
        this.pupupDialog.popup();
      }, 0);
      this.resetHighlight();
    }
  }
  handleCopyVerse = async () => {
    copyVerse(this.state.selectVerse);
    this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_copy_successed') });
    setTimeout(() => {
      this.pupupDialog.popup();
    }, 0);
    this.resetHighlight();
  }
  handleVerseClick = async (verseItem) => {
    const delta = new Date().getTime() - this.state.lastPress;
    if(delta < 300) {
      setTimeout(() => {
        this.fullScreenAnimation();
      }, 0);
    }
    const key = `${verseItem.version}-${verseItem.book_ref}-${verseItem.chapter_nr}-${verseItem.verse_nr}`;
    const keyId = `${verseItem.id}-${verseItem.version}`;
    if(this.state.selectVerse.hasOwnProperty(keyId)) {
      delete this.state.selectVerse[keyId];
      this.setState({
        selectVerse: {...this.state.selectVerse},
        lastPress: new Date().getTime(),
      });
    } else {
      this.setState({
        selectVerse: {...this.state.selectVerse, [keyId]:{...verseItem, keyId: keyId, createdTime: moment().format('YYYY-MM-DD')}},
        lastPress: new Date().getTime(),
      });
    }
    if(R.isEmpty(this.state.selectVerse)) this.toggleModalTooltip();
    setTimeout(() => {
      this.handleCheckBookmark();
    }, 0);
  }
  resetHighlight = () => {
    this.setState({
      selectVerse: {},
    });
  }
  handleScroll = async (event) => {
    this.closeActionButton();
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    if(this.state.isTooltipModalVisible) return;
    const paddingToBottom = 20;
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > this.offset ? 'down' : 'up';
    const distance = this.offset ? (this.offset - currentOffset) : 0;
    const footerNewPosition = this.state.footerScrollY._value - distance;
    if (currentOffset > 0 && currentOffset < (this.contentHeight - this.scrollViewHeight)) {
      if (direction === 'down') { //往下滑
        this.setState({
          fullScreenMode: true,
        });
        this.state.arrowFadeInOpacity.setValue(1);
        if (this.state.footerScrollY._value < 50) {
          this.state.footerScrollY.setValue(footerNewPosition > 50 ? 50 : footerNewPosition);
          this.state.headerScrollY.setValue(footerNewPosition > 30 ? -100 : -footerNewPosition);
        }
        if (this.state.footerScrollY._value < 200) {
          this.state.fadeInOpacity.setValue(footerNewPosition > 50 ? 0 : 1 - footerNewPosition / 100);
        }
      }
      if (direction === 'up') { //往上滑
        this.setState({
          fullScreenMode: footerNewPosition == 50 ? true : false,
        });
        this.state.arrowFadeInOpacity.setValue(footerNewPosition == 50 ? 1 : 0);
        if (this.state.footerScrollY._value >= 0) {
          this.state.footerScrollY.setValue(footerNewPosition < 0 ? 0 : footerNewPosition);
          this.state.headerScrollY.setValue(footerNewPosition < 0 ? 0 : footerNewPosition > 30 ? -150 : -footerNewPosition);
          this.state.fadeInOpacity.setValue(footerNewPosition < 0 ? 1 : footerNewPosition == 50 ? 0 : 1 - footerNewPosition / 100);
        }
      }
      this.offset = currentOffset;
    }
    if(layoutMeasurement.height + contentOffset.y >= contentSize.height + 120) {
      if(this.state.hasRead) return;
      if(this.state.markedDates[this.state.currentDate].marked) return;
      if(this.state.content.length == 0) return;
      const markedDates = {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], marked: true}
      }
      const recordMarkedDates ={
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], marked: true, selected: false}
      }
      this.setState({
        finishedReading: true,
        markedDates: markedDates,
      });
      await global.storage.save({key: '@readingSchdule', data: recordMarkedDates, expires: null});
    }
  }
  navigateTo = (toWhere) => {
    this.reset();
    if(toWhere == 'BibleSearch') {
      this.props.navigation.navigate(toWhere, {lang: this.state.defaultLang, setting:this.state.setting, bg: this.state.bg});
      return
    }
    if(toWhere == 'Bookmark') {
      this.props.navigation.navigate(toWhere, {lang: this.state.defaultLang, setting:this.state.setting, bg: this.state.bg});
      return
    }
    if(toWhere == 'Note') {
      this.props.navigation.navigate(toWhere, {done: false, currentDate: this.state.currentDate, setting:this.state.setting, bg: this.state.bg});
      return
    } 
    this.props.navigation.navigate(toWhere);
  }
  render() {
    const { bg, fullScreenMode } = this.state;
    const drawerStyles = {
      drawer: { shadowColor: '#000000', shadowOpacity: 0.8, shadowRadius: 3},
      main: {paddingLeft: 3},
      drawerOverlay: { opacity: 0.1}
    }
    if(R.isEmpty(this.state.content)) {
      return (
        <View style={{height:deviceHeight - 300, flex:1, flexDirection: 'column', justifyContent:'center', alignItems:'center'}}>
          <Text>Loading...</Text>
          <Spinner style={{marginTop:20}} size={70} type={'Wave'}></Spinner>
        </View>
      );
    }
    return (
      <Drawer
        type="displace"
        content={
          <BibleListPanel
            navigation={this.props.navigation}
            defaultLang={this.state.defaultLang}
            oldBooks={this.state.oldBooks}
            newBooks={this.state.newBooks}
            closeControlPanel={this.closeControlPanel}
          />
        }
        captureGestures={true}
        tapToClose={true}
        openDrawerOffset={0.2} // 20% gap on the right side of drawer
        panCloseMask={0.2}
        panOpenMask={25}
        closedDrawerOffset={-3}
        styles={drawerStyles}
        tweenHandler={(ratio) => ({
          main: { opacity:( 2 - ratio) /2 },
          mainOverlay: {
            opacity: ratio / 1.2,
            backgroundColor: 'black',
          },
        })}
        ref={(ref) => this._drawer = ref}
      >
        <StyledContainer bg={bg}>
          <StyledMain
            ref={r => this.contentView = r}
            bg={bg} 
            onScroll={this.handleScroll}
            onContentSizeChange={(w, h) => { this.contentHeight = h }}
            onLayout={(ev) => { this.scrollViewHeight = ev.nativeEvent.layout.height }}
            scrollEventThrottle={16}
          >
            <StyledMainContent bg={bg} onPress={this.handleDoublePress}>
              <View style={{marginTop:60, marginBottom:isIphoneX() ? 20 : 10}}>
                <DiaryContent
                  selectVerse={this.state.selectVerse}
                  fontColor={this.state.setting.fontColor}
                  fontSize={this.state.setting.fontSize}
                  lineHeight={this.state.setting.lineHeight}
                  fontFamily={this.state.setting.fontFamily}
                  readingMode={this.state.setting.readingMode}
                  content={this.state.content}
                  defaultLang={this.state.defaultLang}
                  date={this.state.date}
                  contentView={this.state.contentView}
                  marked={this.state.markedDates[this.state.currentDate].marked}
                  highlightList={this.state.highlightList}
                  handleVerseClick={this.handleVerseClick} //自動curry帶入verseItem
                  closeActionButton={this.closeActionButton}
                  setFullScreenMode={this.setFullScreenMode}
                />
              </View>
            </StyledMainContent>
          </StyledMain>
        { !this.state.finishedReading &&
          <Animated.View
            style={[
              styles.fixedHeader,
              { 
                opacity: this.state.fadeInOpacity,
                transform: [{ translateY: this.state.headerScrollY }]
              },
            ]}
          >
            <Header
              ref={r => this.header = r}
              fullScreenMode={false}
              navigation={this.props.navigation}
              toggleModal={this.toggleModalCalendar}
              navigateTo={this.navigateTo}
              closeFooterActionButton={this.closeFooterActionButton}
              openControlPanel={this.openControlPanel}
            />
          </Animated.View>
        }
        { !this.state.finishedReading &&
          <Animated.View
            style={[
              styles.fixedFooter,
              { opacity: this.state.fadeInOpacity,
                transform: [{ translateY: this.state.footerScrollY }] 
              },
            ]}
          >
            <Footer
              ref={r => this.footer = r}
              handleNextDay={this._handleNextDay}
              handlePreviousDay={this._handlePreviousDay}
              handeleChangeLang={this._handeleChangeLang}
              defaultLang={this.state.defaultLang}
              getDiaryBiblePhrase={this.getDiaryBiblePhrase}
              navigation={this.props.navigation}
              toggleModal={this.toggleModalFontSetting}
              fullScreenMode={fullScreenMode}
              closeHeaderActionButton={this.closeHeaderActionButton}
            />
          </Animated.View>
        }
        { !this.state.finishedReading &&
          <Animated.View
            style={[
              styles.fixedArrowUp,
              { 
                opacity: this.state.arrowFadeInOpacity,
              },
            ]}
          >
            <ArrowUp
              handeleScrollTop={this._handeleScrollTop}
            />
          </Animated.View>
        }
        <Pupup text={this.state.popupText} ref={r => this.pupupDialog = r}/>
        { this.state.finishedReading ? <Check finishedReading={this.state.finishedReading} content={this.state.content} handleFinished={this._handleFinished} /> : null}
        { !this.state.finishedReading &&
          <CalendarModal
            defaultLang={this.state.defaultLang}
            isCalendarModalVisible={this.state.isCalendarModalVisible}
            currentDate={this.state.currentDate}
            handleChangeDay={this._handleChangeDay}
            toggleModalCalendar={this.toggleModalCalendar}
            markedDates={this.state.markedDates}
            handleMonthChange={this._handleMonthChange}
          />
        }
        { !this.state.finishedReading &&
          <Tooltip
            isTooltipModalVisible={this.state.isTooltipModalVisible}
            toggleModalTooltip={this.toggleModalTooltip}
            closeTooltip={this.closeTooltip}
            handleHighlight={this.handleHighlight}
            handleBookmark={this.handleBookmark}
            handleCopyVerse={this.handleCopyVerse}
            handleShare={this.handleShare}
            bookmarkIsMatch={this.state.bookmarkIsMatch}
          />
        }
        { !this.state.finishedReading &&
          <FontPanelModal
            isFontSettingModalVisible={this.state.isFontSettingModalVisible}
            toggleModalFontSetting={this.toggleModalFontSetting}
            handleSettingFontFamily={this._handleSettingFontFamily}
            handleSettingFontSize={this._handleSettingFontSize}
            handleSettingLineHeight={this._handleSettingLineHeight}
            handleSettingReadingMode={this._handleSettingReadingMode}
            handleSliderValueChange={this._handleSliderValueChange}
            setting={this.state.setting}
          />
        }
        </StyledContainer>
      </Drawer>
    );
  }
}

const styles = StyleSheet.create({
  fixedHeader: {
    zIndex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },
  fixedFooter: {
    position: 'absolute',
    zIndex: 3,
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  fixedArrowUp: {
    zIndex: 2,
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 50,
    marginBottom: isIphoneX() ? 70 : 60,
    height: 50,
  }
});
