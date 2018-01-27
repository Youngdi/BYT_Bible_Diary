import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  AsyncStorage,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import ScreenBrightness from 'react-native-screen-brightness';
import { isIphoneX } from 'react-native-iphone-x-helper';
import styled from "styled-components/native";
import I18n, { getLanguages } from 'react-native-i18n';
import * as R from 'ramda';
import Pupup from '../components/Popup';
import bibleFlag from '../constants/bible';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CalendarModal from '../components/Calendar';
import FontPanelModal from '../components/FontPanel';
import DiaryContent from '../components/DiaryContent';
import ArrowUp from '../components/ArrowUp';
import Check from '../components/Check';
import Tooltip from '../components/Tooltip';

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
const StyledDiaryText = styled.Text`
  margin-left:15px;
  margin-right:15px;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-weight: 600;
  font-family: ${props => props.fontFamily};
`;

// Available languages
I18n.translations = {
  'zh-hant-TW': require('../translations/cht'),
  'zh-hant': require('../translations/cht'),
  'zh-TW': require('../translations/cht'),
  'zh-hans': require('../translations/chs'),
  'en': require('../translations/en'),
  'ja': require('../translations/ja'),
};
export default class DiaryRead extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      header: null,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      popupText: '',
      defaultLang: 'cht',
      lastPress: 0,
      scrollInitPosition:0,
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
      setting: {
        fontFamily: 'Avenir',
        fontSize: 18,
        fontColor: '#000',
        lineHeight: 28,
        brightnessValue: 1,
        readingMode: 0, // 0 -> day, 1 -> night
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
      const readingRecord = await AsyncStorage.getItem('@readingSchdule');
      const systemLang = await getLanguages();
      this.setState({
        systemLang: systemLang,
        markedDates: {
          ...JSON.parse(readingRecord),
          [this.state.date.dateString]: {
            selected : true,
            marked : JSON.parse(readingRecord)[this.state.date.dateString].hasOwnProperty('marked') ? true : false,
          }
        },
      })
    } catch (error) {
      // Error saving data
    }
  }
  componentWillMount = () => {
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  componentDidMount = () => {
    ScreenBrightness.getBrightness().then(brightness => {
      this.setState({
        contentView: this.contentView,
        setting:{
          ...this.state.setting,
          brightnessValue: brightness,
        },
      });
    });
  }
  generateContent = async () => {
    const highlightList = await AsyncStorage.getItem('@highlightList');
    const { month, day}  = this.state.date;
    const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = this.props.navigation.state.params.db;
    let bibleVersion = realm_bible_cht;
    if(this.state.defaultLang == 'cht') bibleVersion = realm_bible_cht;
    if(this.state.defaultLang == 'chs') bibleVersion = realm_bible_chs;
    if(this.state.defaultLang == 'en') bibleVersion = realm_bible_kjv;
    if(this.state.defaultLang == 'ja') bibleVersion = realm_bible_japan;
    const schedule_results = realm_schedule.filtered(`month = ${month} AND day = ${day}`);
    const _schedule_results = schedule_results.reduce((acc, val) => {
      let _acc = acc;
      let _val = val;
      if(val.chapter_from == val.chapter_to) return [...acc, val];
      for(let i = 0; i <= val.chapter_to - val.chapter_from; i++) {
        _val = {..._val, chapter_from: val.chapter_from + i, chapter_to: val.chapter_from + i}
        _acc = [..._acc, _val];
      }
      return _acc;
    }, []);
    const content = _schedule_results.map(item => {
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
        highlightList: JSON.parse(highlightList) ? JSON.parse(highlightList) : {},
      });
    } else {
      this.setState({
        content: content,
        highlightList: JSON.parse(highlightList) ? JSON.parse(highlightList) : {},
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
    }
    this.setState({
      lastPress: new Date().getTime(),
    });
  }
  _getDiaryBiblePhrase() {
    let number = Math.floor(Math.random() * 74) + 1;
    let bible_number = `B${number}`;
    Alert.alert(
    `每日一經文\n${bibleFlag[bible_number].chapter}`,
    `${bibleFlag[bible_number].verse}`,
    [
      {text: '確定', onPress: () => {}},
    ],
      { cancelable: false }
    )
  }
  _toggleModalCalendar = () => this.state.fullScreenMode ? null : this.setState({ isCalendarModalVisible: !this.state.isCalendarModalVisible });
  _toggleModalTooltip = () => this.setState({ isTooltipModalVisible: !this.state.isTooltipModalVisible });
  _closeTooltip = () => {
    this.diaryContent.resetHighlight();
    this.setState({ isTooltipModalVisible: false });
  };
  _toggleModalFontSetting = () => this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  _handleNextDay = () => {
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
  _handleSettingLineHeight = (value) => {
    this.setState({
      setting:{
        ...this.state.setting,
        lineHeight: value,
      },
    });
  }
  _handleSettingFontFamily = (font) => {
    this.setState({
      setting:{
        ...this.state.setting,
        fontFamily: font,
      },
    });
  }
  _handleSettingFontSize = (value) => {
    if(this.state.setting.fontSize >= 28 && value == 2) return null;
    if(this.state.setting.fontSize <= 12 && value == -2) return null;
    this.setState({
      setting:{
        ...this.state.setting,
        fontSize: this.state.setting.fontSize + value,
      },
    });
  }
  _handleSettingReadingMode = () => {
    const FontColor = !this.state.setting.readingMode ? '#ccc' : '#000';
    const BgColor = !this.state.setting.readingMode ? '#333' : '#fff';
    this.setState({
      bg: BgColor,
      setting:{
        ...this.state.setting,
        readingMode: !this.state.setting.readingMode,
        fontColor: FontColor,
      },
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
  _handleChangeDay = (day) => {
    this.setState({
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
    setTimeout(() => {
      this.generateContent();
    }, 800);
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
    if(!this.state.fullScreenMode) return null;
    this.contentView.root.scrollTo({y: 0, animated: true});
  }
  _handleScroll = async (e) => {
    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
    const paddingToBottom = 20;
    const direction = contentOffset.y > this.state.scrollPosition ? 'down' : 'up';
    if(direction == 'down' && contentOffset.y > 100) {
      this.setState({
        fullScreenMode: true,
      });
    } else {
      this.setState({
        fullScreenMode: false,
      });
    }
    this.setState({
      scrollPosition: contentOffset.y,
    });
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
      try {
        await AsyncStorage.setItem('@readingSchdule', JSON.stringify(recordMarkedDates));
      } catch (error) {
      }
    }
  }
  _handleFinished = () => {
    this.setState({
      finishedReading: false,
    });
  }
  _handeleChangeLang = (lang) => {
    if(this.state.loadContent) return null;
    let i18nLang;
    if(lang == 'cht') I18n.locale = 'zh-hant';
    if(lang == 'chs') I18n.locale = 'zh-hans';
    if(lang == 'en') I18n.locale = 'en';
    if(lang == 'ja') I18n.locale = 'ja';
    if(lang == 'cht_en') I18n.locale = 'zh-hant';
    this.setState({
      defaultLang: lang,
    });
    this.diaryContent.resetHighlight();
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  _handleHighlight = (color) => {
    this.diaryContent.setHighlight(color);
    this.setState({ isTooltipModalVisible: false });
  }
  _handleBookmark = async () => {
    this.diaryContent.addBookmark();
    this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_bookmark_successed') });
    setTimeout(() => {
      this.pupupDialog.popup();
      }, 0);
  }
  _handleCopyVerse = async () => {
    this.diaryContent.copyVerse();
    this.setState({ isTooltipModalVisible: false, popupText: I18n.t('popup_copy_successed') });
    setTimeout(() => {
    this.pupupDialog.popup();
    }, 0);
  }
  // _onMomentumScrollBegin = (e) => {
  //   this.setState({
  //     scrollInitPosition: e.nativeEvent.pageY,
  //   });
  // }
  render() {
    const { bg, fullScreenMode } = this.state;
    return (
      <StyledContainer bg={bg}>
        { this.state.isTooltipModalVisible ? null : <Header content={this.state.content} fullScreenMode={fullScreenMode} navigation={this.props.navigation} toggleModal={this._toggleModalCalendar}/>}
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
                content={this.state.content}
                defaultLang={this.state.defaultLang}
                date={this.state.date}
                contentView={this.state.contentView}
                marked={this.state.markedDates[this.state.currentDate].marked}
                db={this.props.navigation.state.params.db}
                highlightList={this.state.highlightList}
                toggleModalTooltip={this._toggleModalTooltip}
              />
            </View>
          </StyledMainContent>
        </StyledMain>
        <Pupup text={this.state.popupText} ref={r => this.pupupDialog = r}/>
        { this.state.isTooltipModalVisible ? null : <ArrowUp handeleScrollTop={this._handeleScrollTop} content={this.state.content} fullScreenMode={fullScreenMode} /> }
        { this.state.finishedReading ? <Check finishedReading={this.state.finishedReading} content={this.state.content} handleFinished={this._handleFinished} /> : null}
        { this.state.isTooltipModalVisible ? null :
          <Footer
            handleNextDay={this._handleNextDay}
            handlePreviousDay={this._handlePreviousDay}
            handeleChangeLang={this._handeleChangeLang}
            defaultLang={this.state.defaultLang}
            getDiaryBiblePhrase={this._getDiaryBiblePhrase}
            navigation={this.props.navigation}
            toggleModal={this._toggleModalFontSetting}
            fullScreenMode={fullScreenMode}
            generateContent={this.generateContent}
            content={this.state.content}
          />
        }
       
        <CalendarModal
          isCalendarModalVisible={this.state.isCalendarModalVisible}
          currentDate={this.state.currentDate}
          handleChangeDay={this._handleChangeDay}
          toggleModalCalendar={this._toggleModalCalendar}
          markedDates={this.state.markedDates}
          handleMonthChange={this._handleMonthChange}
        />
        <Tooltip
          isTooltipModalVisible={this.state.isTooltipModalVisible}
          toggleModalTooltip={this._toggleModalTooltip}
          closeTooltip={this._closeTooltip}
          handleHighlight={this._handleHighlight}
          handleBookmark={this._handleBookmark}
          handleCopyVerse={this._handleCopyVerse}
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