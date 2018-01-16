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

const ccc = {
  '2018-01-11': {marked: true}
}
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
        lang: '', // zh-tw
      },
      date: {
        dateString: moment().format('YYYY-MM-DD'),
        day:  Number(moment().format('D')),
        month: Number(moment().format('M')),
        year: Number(moment().format('YYYY')),
      },
      markedDates: {
        ...ccc,
        [moment().format('YYYY-MM-DD')]: {selected: true},
      },
      currentDate: moment().format('YYYY-MM-DD'),
      value:0.2,
      contentView:{}
    };
  }
  componentWillMount = () => {
    this.generateContent();
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
    const {scheduleDB, bible2DB} = this.props.navigation.state.params.db;
    let query;
    query = `SELECT Month, Day, BookID, ChapterFrom, VerseFrom, ChapterTo, VerseTo FROM Schedule where Month = ${this.state.date.month} AND Day = ${this.state.date.day}`;
    const schedule_result = await scheduleDB.executeSql(query);
    const schedule_results = schedule_result[0].rows.raw().map(row => row);
    const _schedule_results = schedule_results.reduce((acc, val) => {
      let _acc = acc;
      let _val = val;
      if(val.ChapterFrom == val.ChapterTo) return [...acc, val];
      for(let i = 0; i <= val.ChapterTo - val.ChapterFrom; i++) {
        _val = {..._val, ChapterFrom: val.ChapterFrom + i, ChapterTo: val.ChapterFrom + i}
        _acc = [..._acc, _val];
      }
      return _acc;
    }, []);
    const bible_results = await Promise.all(_schedule_results.map( async (item) => {
      const query = `SELECT version, book_ref, book_name, book_nr, chapter_nr, verse_nr, verse FROM bible_cht WHERE book_nr = ${item.BookID} AND chapter_nr >= ${item.ChapterFrom} AND chapter_nr <= ${item.ChapterTo} AND verse_nr >= ${item.VerseFrom} AND verse_nr <= ${item.VerseTo ? item.VerseTo: 200}`;
      const bible_result = await bible2DB.executeSql(query);
      const bible_results = bible_result[0].rows.raw().map(row => row);
      return bible_results;
    }));
    this.setState({
      content: bible_results,
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
    }, 0);
  }
  _handleMonthChange = (month) => {
    if(month.year > 2018) {
      this._toggleModalCalendar();
      setTimeout(() => Alert.alert('今年還沒過完呢！'), 1000);
    }
    if(month.year < 2018) {
      this._toggleModalCalendar();
      setTimeout(() => Alert.alert('去年已經不能回頭！'), 1000);
    }
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
    if(layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
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
                date={this.state.date}
                contentView={this.state.contentView}
              />
            </View>
          </StyledMainContent>
        </StyledMain>
        <ArrowUp content={this.state.content} fullScreenMode={fullScreenMode} contentView={this.state.contentView} />
        <Check finishedReading={this.state.finishedReading} content={this.state.content} handleFinished={this._handleFinished} />
        <Footer
          handleNextDay={this._handleNextDay}
          handlePreviousDay={this._handlePreviousDay}
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