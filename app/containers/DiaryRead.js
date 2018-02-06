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

const storage = new Storage({
	size: 1000,
	storageBackend: AsyncStorage,
	defaultExpires: null,
	enableCache: true,
  // sync : {}
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
      oldBooks: [],
      newBooks: [],
      popupText: '',
      defaultLang: 'cht',
      lastPress: 0,
      bg: '#fff',
      fullScreenMode: false,
      isCalendarModalVisible: false,
      isFontSettingModalVisible: false,
      isTooltipModalVisible: false,
      content: [],
      scrollPosition: 0,
      hasRead: 0,
      finishedReading: false,
      loadContent: false,
      bookmarkIsMatch: false,
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
  closeControlPanel = () => {
    this._drawer.close()
  };
  openControlPanel = () => {
    this._drawer.open()
  };
  reset = () => {
    this._closeTooltip();
    this.closeActionButton();
    this.contentView.root.scrollTo({y: 0, animated: false});
    this.setState({
      isCalendarModalVisible: false,
      fullScreenMode: false,
      isFontSettingModalVisible:false,
    });
  }
  closeActionButton = () => {
    if(this.header) this.header.closeActionButton();
    if(this.footer) this.footer.closeActionButton();
  }
  closeHeaderActionButton = () => this.header.closeActionButton();
  closeFooterActionButton = () => this.footer.closeActionButton();
  checkBookmark = (isMatch) => {
    this.setState({
      bookmarkIsMatch : isMatch,
    });
  }
  generateBooks = async (lang) => {
    // const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    // let bibleVersion = realm_bible_cht;
    // if(this.state.defaultLang == 'cht') bibleVersion = realm_bible_cht;
    // if(this.state.defaultLang == 'chs') bibleVersion = realm_bible_chs;
    // if(this.state.defaultLang == 'en') bibleVersion = realm_bible_kjv;
    // if(this.state.defaultLang == 'ja') bibleVersion = realm_bible_japan;
    const bookNameList = bookName[lang];
    this.setState({
      oldBooks: R.slice(0, 39 ,R.values(bookNameList)),
      newBooks: R.slice(39, 66, R.values(bookNameList)),
    });
  }
  generateContent = async () => {
    const highlightList = await global.storage.load({key:'@highlightList'});
    const { month, day}  = this.state.date;
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
    let bibleVersion = realm_bible_cht;
    if(this.state.defaultLang == 'cht') bibleVersion = realm_bible_cht;
    if(this.state.defaultLang == 'chs') bibleVersion = realm_bible_chs;
    if(this.state.defaultLang == 'en') bibleVersion = realm_bible_kjv;
    if(this.state.defaultLang == 'ja') bibleVersion = realm_bible_japan;
    const schedule_results = realm_schedule.filtered(`month = ${month} AND day = ${day}`);
    const schedule_result_reorder = schedule_results.sorted('book_id', false);
    const _schedule_results = schedule_result_reorder.reduce((acc, val) => {
      let _acc = acc;
      let _val = val;
      if(val.chapter_from == val.chapter_to) return [...acc, val];
      for(let i = 0; i <= val.chapter_to - val.chapter_from; i++) {
        _val = {..._val, chapter_from: val.chapter_from + i, chapter_to: val.chapter_from + i}
        _acc = [..._acc, _val];
      }
      return _acc;
    }, []);
    const content = await _schedule_results.map(item => {
      const results = bibleVersion.filtered(`book_nr = ${item.book_id} AND chapter_nr = ${item.chapter_from} AND verse_nr >= ${item.verse_from} AND verse_nr <= ${item.verse_to == 0 ? 200 : item.verse_to}`);
      return results.sorted('verse_nr', false);
    });
    if(this.state.defaultLang == 'cht_en') {
      const jContent = _schedule_results.map(item => {
        const results = realm_bible_kjv.filtered(`book_nr = ${item.book_id} AND chapter_nr >= ${item.chapter_from} AND chapter_nr <= ${item.chapter_to} AND verse_nr >= ${item.verse_from} AND verse_nr <= ${item.verse_to == 0 ? 200 : item.verse_to}`);
        return results.sorted('verse_nr', false);
      });
      const bindContent = jContent.reduce((acc, val, i) => {
        const zipContent = R.zip(content[i], val);
        return [...acc, R.flatten(zipContent)];
      }, []);
      this.setState({
        content: bindContent,
        highlightList: highlightList,
      });
    } else {
      this.setState({
        content: content,
        highlightList: highlightList,
      });
    }
    setTimeout(() => {
      this.setState({
        loadContent: false,
      });
    }, 500);
  }
  _handleDoublePress = () => {
    var delta = new Date().getTime() - this.state.lastPress;
    if(delta < 300) {
      this.setState({
        fullScreenMode: !this.state.fullScreenMode,
      });
      this.closeActionButton();
    }
    this.closeActionButton();
    this.setState({
      lastPress: new Date().getTime(),
    });
  }
  _getDiaryBiblePhrase = () => {
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
  _toggleModalCalendar = () => {
    this.closeActionButton();
    this.state.fullScreenMode ? null : this.setState({ isCalendarModalVisible: !this.state.isCalendarModalVisible });
  }
  _toggleModalTooltip = () => {
    this.closeActionButton();
    this.setState({ isTooltipModalVisible: !this.state.isTooltipModalVisible });
  }
  _closeTooltip = () => {
    this.diaryContent.resetHighlight();
    this.setState({ isTooltipModalVisible: false });
  };
  _toggleModalFontSetting = () => {
    this.closeActionButton();
    this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  }
  _handleNextDay = () => {
    this.closeActionButton();
    if(this.state.fullScreenMode) return null;
    if(this.state.loadContent) return null;
    if(this.state.currentDate == '2018-12-31') {
      Alert.alert('今年還沒過完呢！');
      return null;
    }
    this.diaryContent.resetHighlight();
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
    this.contentView.root.scrollTo({y: 10, animated: true});
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
    });
    this.contentView.root.scrollTo({y: 10, animated: true});
    this.diaryContent.resetHighlight();
    setTimeout( () => {
      this.generateContent();
    }, 10);
  }
  _handleMonthChange = (month) => {
    if(month.year > 2018) {
      this._toggleModalCalendar();
      setTimeout(() => Alert.alert(I18n.t('move_to_next_year')), 1000);
    }
    if(month.year < 2018) {
      this._toggleModalCalendar();
      setTimeout(() => Alert.alert(I18n.t('move_to_previous_year')), 1000);
    }
  }
  _handeleScrollTop = (e) => {
    this.closeActionButton();
    if(!this.state.fullScreenMode) return null;
    this.contentView.root.scrollTo({y: 0, animated: true});
  }
  _handleScroll = async (e) => {
    this.closeActionButton();
    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
    const paddingToBottom = 20;
    const direction = contentOffset.y > this.state.scrollPosition ? 'down' : 'up';
    if(this.state.isTooltipModalVisible) return;
    if(contentOffset.y < 200) this.setState({fullScreenMode: false});
    // if(direction == 'down' && contentOffset.y > 100) {
    //   this.setState({
    //     fullScreenMode: true,
    //   });
    // } else {
    //   this.setState({
    //     fullScreenMode: false,
    //   });
    // }
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
  _handleFinished = () => {
    this.setState({
      finishedReading: false,
    });
  }
  _handeleChangeLang = async (lang) => {
    this.closeActionButton();
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
  _handleHighlight = (color) => {
    this.diaryContent.setHighlight(color);
    this.setState({ isTooltipModalVisible: false });
  }
  _handleBookmark = async () => {
    this.diaryContent.addBookmark(this.state.bookmarkIsMatch);
    this.setState({ isTooltipModalVisible: false, popupText: this.state.bookmarkIsMatch ? I18n.t('popup_bookmark_removed') : I18n.t('popup_bookmark_successed') });
    setTimeout(() => {
      this.pupupDialog.popup();
      }, 0);
  }
  _handleShare = async () => {
    const copyText = this.diaryContent.generateCopyText();
    const share = await Share.share({
      message: copyText,
      title: this.state.currentDate,
    });
    if(share.action == "sharedAction") {
      this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_share_successed') });
      this.diaryContent.resetHighlight();
      setTimeout(() => {
        this.pupupDialog.popup();
        }, 0);
    }
  }
  _handleCopyVerse = async () => {
    this.diaryContent.copyVerse();
    this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_copy_successed') });
    setTimeout(() => {
    this.pupupDialog.popup();
    }, 0);
  }
  navigateTo = (toWhere) => {
    this.reset();
    if(toWhere == 'BibleSearch') {
      this.props.navigation.navigate(toWhere, {lang: this.state.lang, setting:this.state.setting, bg: this.state.bg});
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
        type="overlay"
        content={
          <BibleListPanel
            navigation={this.props.navigation}
            defaultLang={this.state.defaultLang}
            oldBooks={this.state.oldBooks}
            newBooks={this.state.newBooks}
            closeControlPanel={this.closeControlPanel}
          />
        }
        tapToClose={true}
        openDrawerOffset={0.2} // 20% gap on the right side of drawer
        panCloseMask={0.2}
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
        { !this.state.finishedReading ?
          <Header
            ref={r => this.header = r}
            content={this.state.content}
            fullScreenMode={fullScreenMode}
            navigation={this.props.navigation}
            toggleModal={this._toggleModalCalendar}
            navigateTo={this.navigateTo}
            closeFooterActionButton={this.closeFooterActionButton}
            openControlPanel={this.openControlPanel}
          />
          : null
        }
          <StyledMain
            ref={r => this.contentView = r}
            bg={bg} 
            onScroll={this._handleScroll.bind(this)}
            // onTouchStart={this._onMomentumScrollBegin.bind(this)}
            scrollEventThrottle={16}
          >
            <StyledMainContent bg={bg} onPress={this._handleDoublePress}>
              <View style={{marginTop:60, marginBottom:isIphoneX() ? 65 : 40}}>
                <DiaryContent
                  ref={ r => this.diaryContent = r}
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
                  toggleModalTooltip={this._toggleModalTooltip}
                  isTooltipModalVisible={this.state.isTooltipModalVisible}
                  checkBookmark={this.checkBookmark}
                  handleDoublePress={this._handleDoublePress}
                  closeActionButton={this.closeActionButton}
                />
              </View>
            </StyledMainContent>
          </StyledMain>
          <Pupup text={this.state.popupText} ref={r => this.pupupDialog = r}/>
          { !this.state.finishedReading ? <ArrowUp handeleScrollTop={this._handeleScrollTop} content={this.state.content} fullScreenMode={fullScreenMode} /> : null}
          { this.state.finishedReading ? <Check finishedReading={this.state.finishedReading} content={this.state.content} handleFinished={this._handleFinished} /> : null}
          { !this.state.finishedReading ? 
            <Footer
              ref={r => this.footer = r}
              handleNextDay={this._handleNextDay}
              handlePreviousDay={this._handlePreviousDay}
              handeleChangeLang={this._handeleChangeLang}
              defaultLang={this.state.defaultLang}
              getDiaryBiblePhrase={this._getDiaryBiblePhrase}
              navigation={this.props.navigation}
              toggleModal={this._toggleModalFontSetting}
              fullScreenMode={fullScreenMode}
              content={this.state.content}
              closeHeaderActionButton={this.closeHeaderActionButton}
            />
            : null
          }
        { !this.state.finishedReading ?
          <CalendarModal
            defaultLang={this.state.defaultLang}
            isCalendarModalVisible={this.state.isCalendarModalVisible}
            currentDate={this.state.currentDate}
            handleChangeDay={this._handleChangeDay}
            toggleModalCalendar={this._toggleModalCalendar}
            markedDates={this.state.markedDates}
            handleMonthChange={this._handleMonthChange}
          />
          : null
        }
        { !this.state.finishedReading ?
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
          : null
        }
        { !this.state.finishedReading ?
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
          : null
        }
        </StyledContainer>
      </Drawer>
    );
  }
}