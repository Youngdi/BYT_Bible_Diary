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

const a = `Output Box - Random strings/passwords will display here.Load objects used for random string generation into the 
"Object Input Box" above. Objects above can be characters, words, sentences, etc.Test by clicking the "Generate random strings" 
button above to generate 10, 14 character, random strings from the default input objects.NOTICE: Tool uses Javascript method Math.random() 
pseudorandom generator to obtain random string. Do not use for critical random results.Privacy of Data: This tool is built-with and functions-in 
Client Side JavaScripting, so only your computer will see or process your data input/output.swords will display here.Load objects used for random string generation into the 
"Object Input Box" above. Objects above can be characters, words, sentences, etc.Test by clicking the "Generate random strings" 
button above to generate 10, 14 character, random strings from the default input objects.NOTIrom the default input objects.NOTICE: Tool uses Javascript method Math.random() 
pseudorandom generator to obtain random string. Do not use for critical random results.Privacy of Data: This tool is built-with and functions-in 
Client Side JavaScripting, so only your computer will see or process your data input/output.swords will display here.Load objects used for random string generation into the 
"Object Input Box" above. Objects above can be characters, words, sentences, etc.Test by c`;
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
      bg: '#fff',
      fullScreenMode: false,
      isCalendarModalVisible: false,
      isFontSettingModalVisible: false,
      content: '',
      scrollPosition: 0,
      hasRead: 0,
      setting: {
        fontFamily: 'Avenir',
        fontSize: 18,
        fontColor: '#000',
        lineHeight: 28,
        brightnessValue: 1,
        readingMode: 0, // 0 -> day, 1 -> night
        lang: '', // zh-tw
      },
      day: {
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
    };
  }
  componentDidMount() {
    ScreenBrightness.getBrightness().then(brightness => {
      this.setState({
        content: a,
        setting:{
          ...this.state.setting,
          brightnessValue: brightness,
        },
      });
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
  _toggleModalFontSetting = () => this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  _handleNextDay = () => {
    if(this.state.currentDate == '2018-12-31') {
      Alert.alert('今年還沒過完呢！');
      return null;
    }
    const nextDay = moment(this.state.currentDate, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD");
    this.setState({
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [nextDay]: {...this.state.markedDates[nextDay], selected: true},
      },
      currentDate: nextDay,
    });
  }
  _handlePreviousDay = () => {
    if(this.state.currentDate == '2018-01-01') {
      Alert.alert('去年已經不能回頭！');
      return null;
    }
    const previousDay = moment(this.state.currentDate, "YYYY-MM-DD").add(-1, 'days').format("YYYY-MM-DD");
    this.setState({
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [previousDay]: {...this.state.markedDates[previousDay], selected: true},
      },
      currentDate: previousDay,
    });
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
      day,
      markedDates: {
        ...this.state.markedDates,
        [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], selected: false},
        [day.dateString]: {...this.state.markedDates[day.dateString], selected: true},
      },
      currentDate: day.dateString,
    });
    this._toggleModalCalendar();
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
    if(direction == 'down') {
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
      this.setState({
        markedDates: {
          ...this.state.markedDates,
          [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], marked: true},
        },
      });
    }
  }
  render() {
    const { bg, fullScreenMode } = this.state;
    return (
      <StyledContainer bg={bg}>
        <Header fullScreenMode={fullScreenMode} navigation={this.props.navigation} toggleModal={this._toggleModalCalendar}/>
        <StyledMain
          bg={bg} 
          onScroll={this._handleScroll.bind(this)}
          scrollEventThrottle={16}
        >
          <StyledMainContent bg={bg}>
            <View style={{marginTop:60, marginBottom:isIphoneX() ? 65 : 40}}>
              <DiaryContent 
                fontColor={this.state.setting.fontColor}
                fontSize={this.state.setting.fontSize}
                lineHeight={this.state.setting.lineHeight}
                fontFamily={this.state.setting.fontFamily}
                content={this.state.content}
              />
            </View>
          </StyledMainContent>
        </StyledMain>
        <Footer
          handleNextDay={this._handleNextDay}
          handlePreviousDay={this._handlePreviousDay}
          getDiaryBiblePhrase={this._getDiaryBiblePhrase}
          navigation={this.props.navigation}
          toggleModal={this._toggleModalFontSetting}
          fullScreenMode={fullScreenMode}
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