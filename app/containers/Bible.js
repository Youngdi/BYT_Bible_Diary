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
  StyleSheet,
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
import BibleContent from '../components/BibleContent';
import { dbFindChapter, dbFindVerse, dbGetBookContent } from '../api/api';
import { copyVerse, setHighlight, addBookmark, checkBookmark } from '../api/tooltip';

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
      footerScrollY: new Animated.Value(0),
      fadeInOpacity: new Animated.Value(1),
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
    this.offset = 0;
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
  handleScroll = (event) => {
    this.closeActionButton();
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    if(this.state.isTooltipModalVisible) return;
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > this.offset ? 'down' : 'up';
    const distance = this.offset ? (this.offset - currentOffset) : 0;
    const footerNewPosition = this.state.footerScrollY._value - distance;
    if (currentOffset > 0 && currentOffset < (this.contentHeight - this.scrollViewHeight)) {
      if (direction === 'down') { //往下滑
        this.setState({
          fullScreenMode: true,
        });
        if (this.state.footerScrollY._value < 50) {
          this.state.footerScrollY.setValue(footerNewPosition > 50 ? 50 : footerNewPosition);
        }
        if (this.state.footerScrollY._value < 200) {
          this.state.fadeInOpacity.setValue(footerNewPosition > 50 ? 0 : 1 - footerNewPosition / 100);
        }
      }
      if (direction === 'up') { //往上滑
        this.setState({
          fullScreenMode: footerNewPosition == 50 ? true : false,
        });
        if (this.state.footerScrollY._value >= 0) {
          this.state.footerScrollY.setValue(footerNewPosition < 0 ? 0 : footerNewPosition);
          this.state.fadeInOpacity.setValue(footerNewPosition < 0 ? 1 : footerNewPosition == 50 ? 0 : 1 - footerNewPosition / 100);
        }
      }
      this.offset = currentOffset;
    }
  }
  closeActionButton = () => {
    if(this.footer) this.footer.closeActionButton();
  }
  fullScreenAnimation = () => {
    this.state.fadeInOpacity.setValue(this.state.fullScreenMode ? 0 : 1);
    this.state.footerScrollY.setValue(this.state.fullScreenMode ? 50 : 0);
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
    ]).start();
    this.setState({
      fullScreenMode: !this.state.fullScreenMode,
    });
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
  toggleModalTooltip = () => {
    this.setState({ isTooltipModalVisible: !this.state.isTooltipModalVisible });
  }
  closeTooltip = () => {
    this.resetHighlight();
    this.setState({ isTooltipModalVisible: false });
  };
  getDiaryBiblePhrase = () => {
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
    this.setState({
      selectVerse: {},
    });
  }
  generateContent = async (chapter_index, book_nr_index = 0) => {
    const highlightList = await global.storage.load({key:'@highlightList'});
    const {results_findLength, content} = await dbGetBookContent(this.state.book_nr, this.state.chapter_nr, this.state.lang);
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
        const results_findLength = await dbFindChapter(66, 'en');
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
        const results_findLength = await dbFindChapter(this.state.book_nr - 1, 'en');
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
  handeleChangeLang = async (lang) => {
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
    setTimeout(() => {
      this.generateContent();
    }, 0);
  }
  toggleModalFontSetting = () => {
    this.state.fullScreenMode ? null : this.setState({ isFontSettingModalVisible: !this.state.isFontSettingModalVisible });
  }
  handleSettingFontFamily = async (font) => {
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
  handleSettingFontSize = async (value) => {
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
          onScroll={this.handleScroll}
          onContentSizeChange={(w, h) => { this.contentHeight = h }}
          onLayout={(ev) => { this.scrollViewHeight = ev.nativeEvent.layout.height }}
          scrollEventThrottle={16}
        >
          <StyledMainContent
            bg={this.state.bg}
          >
          <BibleContent
            selectVerse={this.state.selectVerse}
            fontColor={this.state.setting.fontColor}
            fontSize={this.state.setting.fontSize}
            lineHeight={this.state.setting.lineHeight}
            fontFamily={this.state.setting.fontFamily}
            readingMode={this.state.setting.readingMode}
            content={this.state.content}
            defaultLang={this.state.lang}
            highlightList={this.state.highlightList}
            handleVerseClick={this.handleVerseClick}
            handlelayout={this.handlelayout}
          />
          </StyledMainContent>
        </StyledMain>
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
              ref={(el) => this.footer = el}
              handleNextDay={this._handleNext}
              handlePreviousDay={this._handlePrevious}
              handeleChangeLang={this.handeleChangeLang}
              defaultLang={this.state.lang}
              getDiaryBiblePhrase={this.getDiaryBiblePhrase}
              navigation={this.props.navigation}
              toggleModal={this.toggleModalFontSetting}
              fullScreenMode={this.state.fullScreenMode}
              content={[1,2]}
            />
          </Animated.View>
        }
        <Pupup text={this.state.popupText} ref={r => this.pupupDialog = r}/>
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
        <FontPanelModal
          isFontSettingModalVisible={this.state.isFontSettingModalVisible}
          toggleModalFontSetting={this.toggleModalFontSetting}
          handleSettingFontFamily={this.handleSettingFontFamily}
          handleSettingFontSize={this.handleSettingFontSize}
          handleSettingLineHeight={this._handleSettingLineHeight}
          handleSettingReadingMode={this._handleSettingReadingMode}
          handleSliderValueChange={this._handleSliderValueChange}
          setting={this.state.setting}
        />
      </StyledContainer>
    );
  }
}

const styles = StyleSheet.create({
  fixedFooter: {
    position: 'absolute',
    zIndex: 3,
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
});
