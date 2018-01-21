import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import ScreenBrightness from 'react-native-screen-brightness';
import { isIphoneX } from 'react-native-iphone-x-helper';
import styled from "styled-components/native";
import bibleFlag from '../constants/bible';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CalendarModal from '../components/Calendar';
import FontPanelModal from '../components/FontPanel';
import DiaryContent from '../components/DiaryContent';
import ArrowUp from '../components/ArrowUp';
import Check from '../components/Check';
import I18n, { getLanguages } from 'react-native-i18n';

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

const fakeRecord = {
  '2018-01-11': {marked: true}
}

// Available languages
I18n.translations = {
  'zh-hant': require('../translations/cht'),
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
      systemLang: '',
      defaultLang: 'cht',
      lastPress: 0,
      scrollInitPosition:0,
      bg: '#fff',
      fullScreenMode: false,
      isCalendarModalVisible: false,
      isFontSettingModalVisible: false,
      content: [],
      scrollPosition: 0,
      hasRead: 0,
      finishedReading: false,
      setting: {
        fontFamily: 'Avenir',
        fontSize: 18,
        fontColor: '#000',
        lineHeight: 28,
        brightnessValue: 1,
        readingMode: 0, // 0 -> day, 1 -> night
      },
      date: {
        dateString: moment().format('YYYY-MM-DD'),
        day:  Number(moment().format('D')),
        month: Number(moment().format('M')),
        year: Number(moment().format('YYYY')),
      },
      markedDates: {
        ...fakeRecord,
        [moment().format('YYYY-MM-DD')]: {selected: true},
      },
      currentDate: moment().format('YYYY-MM-DD'),
      value:0.2,
      contentView:{}
    };
  }
  componentWillMount = () => {
    getLanguages().then(languages => {
      this.setState({ systemLang: languages });
    });
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  componentDidMount = async () => {
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
    const { month, day}  = this.state.date;
    const { bibleDB } = this.props.navigation.state.params.db;
    let query;
    let bibleVersion;
    if(this.state.defaultLang == 'cht') bibleVersion = 'cht';
    if(this.state.defaultLang == 'chs') bibleVersion = 'chs';
    if(this.state.defaultLang == 'en') bibleVersion = 'kjv';
    if(this.state.defaultLang == 'ja') bibleVersion = 'japan';
    if(this.state.defaultLang == 'cht_en') {
      bibleVersion = 'cht';
      // 中英對照版
      query = `select b.version, b.book_ref, b.book_name, 
      b.book_nr, b.chapter_nr, b.verse_nr, b.verse, b.book_name_short, b.testament,
      j.verse as compare_verse
      from bible_${bibleVersion} as b
      Left join schedule as sc
      on sc.month = ${month} AND sc.day = ${day}
      Left join bible_kjv as j
      on j.book_nr = b.book_nr AND j.chapter_nr = b.chapter_nr AND j.verse_nr = b.verse_nr
      where b.book_nr = sc.book_id
      AND b.chapter_nr >= sc.chapter_from
      AND b.chapter_nr <= sc.chapter_to
      AND b.verse_nr >= sc.verse_from
      AND b.verse_nr <= (CASE WHEN sc.verse_to = 0 THEN 80 ELSE sc.verse_to END)
      ORDER BY b.book_nr,b.chapter_nr,b.verse_nr`;
    } else {
      query = `select b.version, b.book_ref, b.book_name, 
      b.book_nr, b.chapter_nr, b.verse_nr, b.verse, b.book_name_short, b.testament
      from bible_${bibleVersion} as b
      Left join schedule as sc
      on sc.month = ${month} AND sc.day = ${day}
      where b.book_nr = sc.book_id
      AND b.chapter_nr >= sc.chapter_from
      AND b.chapter_nr <= sc.chapter_to
      AND b.verse_nr >= sc.verse_from
      AND b.verse_nr <= (CASE WHEN sc.verse_to = 0 THEN 80 ELSE sc.verse_to END)
      ORDER BY b.book_nr,b.chapter_nr,b.verse_nr`;
    }

    const getVerse = await bibleDB.executeSql(query);
    const roughResults = getVerse[0].rows.raw().map(row => row);
    let results = [];
    let previousFlag;
    let index = 0;
    for(let i = 0; i < roughResults.length ; i++){
      if(i == 0) previousFlag = roughResults[i].book_ref + roughResults[i].chapter_nr;
      if(i == 0) results[index] = [];
      if((roughResults[i].book_ref + roughResults[i].chapter_nr) == previousFlag){
        results[index] = [...results[index], roughResults[i]];
      } else {
        index++;
        if(typeof results[index] === 'undefined') results[index] = [];
        results[index] = [...results[index], roughResults[i]];
      }
      previousFlag = roughResults[i].book_ref + roughResults[i].chapter_nr;
    }
    this.setState({
      content: results,
    });
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
    })
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
  _toggleModalFontSetting = () => this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  _handleNextDay = () => {
    if(this.state.fullScreenMode) return null;
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
      content: [],
      finishedReading: false,
    });
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  _handlePreviousDay = () => {
    if(this.state.fullScreenMode) return null;
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
      content: [],
      finishedReading: false,
    });
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
      date: day,
      isCalendarModalVisible: !this.state.isCalendarModalVisible,
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [day.dateString]: {...this.state.markedDates[day.dateString], selected: true},
      },
      currentDate: day.dateString,
      content: [],
      finishedReading: false,
    });
    setTimeout(() => {
      this.generateContent();
    }, 300);
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
  _handleScroll = (e) => {
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
      this.setState({
        finishedReading: true,
        markedDates: {
          ...this.state.markedDates,
          [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], marked: true},
        },
      });
    }
  }
  _handleFinished = () => {
    this.setState({
      finishedReading: false,
    });
  }
  _handeleChangeLang = (lang) => {
    let i18nLang;
    if(lang == 'cht') I18n.locale = 'zh-hant';
    if(lang == 'chs') I18n.locale = 'zh-hans';
    if(lang == 'en') I18n.locale = 'en';
    if(lang == 'ja') I18n.locale = 'ja';
    if(lang == 'cht_en') I18n.locale = 'zh-hant';
    this.setState({
      defaultLang: lang,
      // content: [],
    });
    setTimeout(() => {
      this.generateContent();
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
        <Header content={this.state.content} fullScreenMode={fullScreenMode} navigation={this.props.navigation} toggleModal={this._toggleModalCalendar}/>
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
                fontColor={this.state.setting.fontColor}
                fontSize={this.state.setting.fontSize}
                lineHeight={this.state.setting.lineHeight}
                fontFamily={this.state.setting.fontFamily}
                content={this.state.content}
                defaultLang={this.state.defaultLang}
                date={this.state.date}
                contentView={this.state.contentView}
                marked={this.state.markedDates[this.state.currentDate].marked}
              />
            </View>
          </StyledMainContent>
        </StyledMain>
        <ArrowUp handeleScrollTop={this._handeleScrollTop} content={this.state.content} fullScreenMode={fullScreenMode} />
        <Check finishedReading={this.state.finishedReading} content={this.state.content} handleFinished={this._handleFinished} />
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
        <CalendarModal
          isCalendarModalVisible={this.state.isCalendarModalVisible}
          currentDate={this.state.currentDate}
          handleChangeDay={this._handleChangeDay}
          toggleModalCalendar={this._toggleModalCalendar}
          markedDates={this.state.markedDates}
          handleMonthChange={this._handleMonthChange}
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