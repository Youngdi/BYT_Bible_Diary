import React, { Component } from "react";
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Swipeout from "react-native-swipeout";
import ModalDropdown from 'react-native-modal-dropdown';
import * as R from 'ramda';
import I18n from 'react-native-i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from "styled-components/native";
import { SearchBar } from 'react-native-elements';
import ArrowUp from '../components/ArrowUp';
import { bookName } from '../constants/bibleBookList';
const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');
const StyledHeaderTitle = styled.Text`
  font-size:20;
  font-family: 'Times New Roman';
  font-weight: 900;
  color: ${props => props.color};
`;
const StyledOptionBox = styled.View`
  margin-top:10px;
  margin-bottom:10px;
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
const StyledOptionBoxRow = styled.View`
  padding: 10px;
  padding-top: 5px;
  display:flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100px;
  height: 60px;
  border-color: #ccc;
  border-width:1px;
`;
const StyledOptionRow = styled.View`
  display:flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;
class FlatListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarkEnable: true,
    }
  }
  render() {
    const {id, version, testament, book_ref, book_name, book_name_short, book_nr, chapter_nr, verse_nr, verse, createdTime, keyId} = this.props.item;
    const setting = this.props.setting;
    let lang = version;
    if(version == 'japan') lang = 'ja';
    if(version == 'kjv') lang = 'en';
    const sperateVerse = (verse, searchKey) => [
      ...(verse.indexOf(searchKey) == -1)
      ? [verse] 
      : [verse.slice(0, verse.indexOf(searchKey)),
          searchKey,
          ...sperateVerse(
            verse.slice(verse.indexOf(searchKey) + searchKey.length),
            searchKey
           )
         ].filter(v => v != "")
    ];
    const verseArray = sperateVerse(verse, this.props.searchKey);

    return (
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "column",
            borderLeftWidth:1,
            borderLeftColor:'#eee',
            borderRightWidth:1,
            borderRightColor:'#eee',
            borderTopWidth:1,
            borderTopColor:'#eee',
            borderBottomWidth:1,
            borderBottomColor:'#ccc',
            backgroundColor:'white',
            marginBottom:2.5,
            marginTop:2.5,
            marginLeft:5,
            marginRight:5,
          }}
          onPress={() => {
            this.props.navigation.navigate('Bible', {
              book_nr: book_nr,
              chapter_nr: chapter_nr,
              verse_nr: verse_nr,
              title: `${book_name}${' '}${chapter_nr}`,
              lang: lang,
              version: version,
              setting: setting,
              bg: setting.readingMode ? '#333' : '#fff',
            });
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor:'white',
              flexDirection: "column",
              justifyContent:'flex-start',
              margin:15,
            }}
          >
            <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
              <Text style={{ fontSize: 18, fontWeight:'800' }}>
                {`${book_name}${' '}${chapter_nr}:${verse_nr}`}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight:'400', lineHeight: 25, marginBottom:10 }}>
              {
                verseArray.map(item =>
                  item.indexOf(this.props.searchKey) > -1
                  ? <Text style={{color:'red'}}>{item}</Text>
                  : <Text>{item}</Text>)
              }
              </Text>
            </View>
          </View>
        </TouchableOpacity>
    );
  }
}

export default class BibleSearch extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const {state, setParams} = navigation;
    return {
      gesturesEnabled: true,
      headerStyle: {
        backgroundColor: state.params.bg,
      },
      title: <StyledHeaderTitle color={state.params.setting.fontColor}>{I18n.t('bible_search_title')}</StyledHeaderTitle>,
      headerLeft: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => navigation.goBack()}
                   >
                    <Ionicons style={{marginLeft:15}} name='ios-arrow-back-outline' size={30} color={state.params.setting.fontColor} />
                  </TouchableOpacity>
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      verseList: [],
      refreshing: false,
      searchKey: '',
      lang: 'cht',
      bookFilterKey: 0,
      chapterFilterKey: 0,
      bookOptionsPlaceHolder: I18n.t('bible_search_placeholder'),
      chapterOptionPlaceHolder: I18n.t('bible_search_placeholder'),
      bookOptions: [],
      chapterOption: [],
    }
  }
  componentWillMount = () => {
    this.generateOptions();
  }
  searchVerse = (e) => {
    try {
      const text = e.nativeEvent.text;
      let results;
      if(text.length == 0) {
        Alert.alert(I18n.t('bible_searchKey_limit'));
        return;
      }
      const { realm_schedule, realm_bible_kjv, realm_bible_japan, realm_bible_cht, realm_bible_chs } = global.db;
      let bibleVersion = realm_bible_cht;
      if(this.state.lang == 'cht') bibleVersion = realm_bible_cht;
      if(this.state.lang == 'cht_en') bibleVersion = realm_bible_cht;
      if(this.state.lang == 'chs') bibleVersion = realm_bible_chs;
      if(this.state.lang == 'en') bibleVersion = realm_bible_kjv;
      if(this.state.lang == 'ja') bibleVersion = realm_bible_japan;
      if(this.state.bookFilterKey == 1){ //舊約
        results = bibleVersion.filtered(`testament = 0 AND verse CONTAINS '${text}'`);
      } else if(this.state.bookFilterKey == 2){ // 新約
        results = bibleVersion.filtered(`testament = 1 AND verse CONTAINS '${text}'`);
      } else if(this.state.bookFilterKey == 0 && this.state.chapterFilterKey == 0){ // 所有
        results = bibleVersion.filtered(`verse CONTAINS '${text}'`);
      } else if(this.state.bookFilterKey != 0 && this.state.chapterFilterKey == 0){ // 指定書卷
        results = bibleVersion.filtered(`book_name_short = '${this.state.bookOptionsPlaceHolder}' AND verse CONTAINS '${text}'`);
      } else if(this.state.bookFilterKey == 0 && this.state.chapterFilterKey != 0){ // 指定章節
        results = bibleVersion.filtered(`chapter_nr = ${this.state.chapterOptionPlaceHolder} AND verse CONTAINS '${text}'`);
      } else if(this.state.bookFilterKey != 0 && this.state.chapterFilterKey != 0){ // 指定書卷及章節
        results = bibleVersion.filtered(`book_name_short = '${this.state.bookOptionsPlaceHolder}' AND chapter_nr = ${this.state.chapterOptionPlaceHolder} AND verse CONTAINS '${text}'`);
      }
      results.sorted('verse_nr', false);
      this.setState({
        verseList: results,
        searchKey: text,
      });
    } catch (error) {
      console.log(error);
    }
  }
  onSelectBook_nr = async (index, value) => {
    await this.setState({
      bookFilterKey: index, // 0 所有, 1舊約, 2新約
      bookOptionsPlaceHolder: value,
    });
    if(this.state.searchKey.length != 0) {
      await this.searchVerse({nativeEvent: {text: this.state.searchKey}});
    }
  }
  onSelectChapter_nr = async (index, value) => {
    await this.setState({
      chapterFilterKey: index, // 0 所有
      chapterOptionPlaceHolder: value,
    });
    if(this.state.searchKey.length != 0) {
      await this.searchVerse({nativeEvent: {text: this.state.searchKey}});
    }
  }
  generateOptions = () => {
    const bookNameList = R.values(bookName[this.props.navigation.state.params.lang]);
    this.setState({
      lang: this.props.navigation.state.params.lang,
      bookOptions: [I18n.t('bible_search_placeholder'), I18n.t('bible_search_old_testament'), I18n.t('bible_search_new_testament'), ...bookNameList],
      chapterOption: [I18n.t('bible_search_placeholder'), ...R.range(1,150)],
    });
  }
  onClearText = () => {
    this.setState({
      verseList: [],
      searchKey: '',
    })
  }
  renderHeader = () => {
    return (
    <View style={{flex:1, width:'100%', flexDirection:'column', justifyContent:'center', alignItems:'center',marginTop:10, marginBottom:20}}>
      <SearchBar
        onEndEditing={this.searchVerse}
        onClearText={this.onClearText}
        platform={`${Platform.OS}`}
        cancelButtonTitle={'Cancel'}
        clearIcon
        lightTheme
        placeholder={`${I18n.t('bookmark_search')}...`}
        round
      />
      <StyledOptionBox>
          <ModalDropdown
            dropdownStyle={{
              width: 100,
              height: 300,
              borderColor: '#ccc',
              borderWidth: 2,
              borderRadius: 3,
            }}
            dropdownTextStyle={{
              fontSize: 16,
              color: '#000',
              backgroundColor:'transparent'
            }}
            dropdownTextHighlightStyle={{
              backgroundColor: '#000',
              color: '#fff'
            }}
            onSelect={this.onSelectBook_nr}
            options={this.state.bookOptions}
          >
            <StyledOptionBoxRow>
              <StyledOptionRow>
                <Text style={{fontSize:13, fontWeight:'300', color:'#333', marginBottom:2}}>{I18n.t('bible_search_book')}</Text>
                <Text style={{fontSize:14, fontWeight:'500', color:'#000'}}>{this.state.bookOptionsPlaceHolder}</Text>
              </StyledOptionRow>
              <View>
                <MaterialCommunityIcons name='menu-down' size={25} color={'#333'} /> 
              </View>
            </StyledOptionBoxRow>
          </ModalDropdown>
          <ModalDropdown
            dropdownStyle={{
              width: 100,
              height: 300,
              borderColor: '#ccc',
              borderWidth: 2,
              borderRadius: 3,
            }}
            dropdownTextStyle={{
              fontSize: 16,
              color: '#000',
              backgroundColor:'transparent'
            }}
            dropdownTextHighlightStyle={{
              backgroundColor: '#000',
              color: '#fff'
            }}
            onSelect={this.onSelectChapter_nr}
            options={this.state.chapterOption}
          >
            <StyledOptionBoxRow>
              <StyledOptionRow>
                <Text style={{fontSize:13, fontWeight:'300', color:'#333', marginBottom:2}}>{I18n.t('bible_search_chapter')}</Text>
                <Text style={{fontSize:14, fontWeight:'500', color:'#000'}}>{this.state.chapterOptionPlaceHolder}</Text>
              </StyledOptionRow>
              <View>
                <MaterialCommunityIcons name='menu-down' size={25} color={'#333'} /> 
              </View>
            </StyledOptionBoxRow>
          </ModalDropdown>
      </StyledOptionBox>
      <View style={{flex:1, justifyContent:'flex-start', alignItems:'center'}}>
        <Text style={{fontSize:14, fontWeight:'400'}}>
          {R.replace('verse_number', this.state.verseList.length, I18n.t('bible_verse_number'))}
        </Text>
      </View>
    </View>
    )
  };
  renderItem = ({item, index}) => {
    return (
      <FlatListItem
        searchKey={this.state.searchKey}
        key={item.keyId}
        addBookmark={this.addBookmark}
        deleteBookmark={this.deleteBookmark}
        item={item}
        index={index}
        setting={this.props.navigation.state.params.setting}
        navigation={this.props.navigation}
      />
    );
  }
  _handeleScrollTop = (e) => {
    this.contentView.scrollToOffset({x: 0, y: 0, animated: true})
  }
  render() {
    return (
      <View style={{flex:1, backgroundColor:'#eee'}}>
        <FlatList
          ref={r => this.contentView = r}
          extraData={this.state}
          ListHeaderComponent={this.renderHeader}
          data={this.state.verseList}
          renderItem={this.renderItem}
        />
        <ArrowUp handeleScrollTop={this._handeleScrollTop} content={this.state.verseList} fullScreenMode={true} />
      </View>
    );
  }
}
