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
import * as R from 'ramda';
import I18n from 'react-native-i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styled from "styled-components/native";
import { SearchBar } from 'react-native-elements';
import ArrowUp from '../components/ArrowUp';
import { isIphoneX } from 'react-native-iphone-x-helper';

const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const StyledHeaderTitle = styled.Text`
  color: ${props => props.color};
  font-size:20;
  font-family: 'Times New Roman';
  font-weight: 900;
`;
const ArrowUpFixedContainer = styled.View`
  z-index: 2;
  position: absolute;
  right: 0;
  bottom: 0;
  width: 50px;
  margin-bottom: ${isIphoneX() ? '70px' : '60px'};
  height: 50px;
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
                {`${book_name}${chapter_nr}:${verse_nr}`}
              </Text>
              {
                this.state.bookmarkEnable ?
                  <TouchableOpacity 
                    hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
                    onPress={() => {
                      this.props.deleteBookmark(keyId);
                      this.setState({
                        bookmarkEnable: !this.state.bookmarkEnable,
                      });
                    }}
                  >
                    <Ionicons color='#777' name='ios-bookmark' size={30} />
                  </TouchableOpacity>
                :
                <TouchableOpacity
                  hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
                  onPress={() => {
                    this.props.addBookmark(this.props.item);
                    this.setState({
                      bookmarkEnable: !this.state.bookmarkEnable,
                    });
                  }}
                >
                  <Ionicons color='#ccc' name='ios-bookmark-outline' size={30} />
                </TouchableOpacity>
              }
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight:'400', lineHeight: 25,marginBottom:10 }}>
                {`${verse}`}
              </Text>
            </View>
            <View style={{display:'flex', justifyContent:'flex-end', flexDirection:'row'}}>
              <Text style={{ fontSize: 14, fontWeight:'200'}}>
                {`${createdTime}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
    );
  }
}

export default class Bookmark extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const {state, setParams} = navigation;
    return {
      gesturesEnabled: true,
      headerStyle: {
        backgroundColor: state.params.bg,
      },
      title: <StyledHeaderTitle color={state.params.setting.fontColor}>Bookmarks</StyledHeaderTitle>,
      headerLeft: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => navigation.goBack()}
                   >
                    <Ionicons style={{marginLeft:15}} name='ios-arrow-back-outline' size={30} color={state.params.setting.fontColor} />
                  </TouchableOpacity>
      ,headerRight: <TouchableOpacity
                      hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                      onPress={() => state.params.handleRefresh()}
                    >
                      <Ionicons style={{marginRight:15}} name='ios-refresh' size={30} color={state.params.setting.fontColor} />
                    </TouchableOpacity>
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      bookmarkList: [],
      bookmarkListfilter: [],
      refreshing: false,
      fullScreenMode: false,
    }
  }
  componentDidMount = async () => {
    this.props.navigation.setParams({ handleRefresh: this.refresh });
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    const _bookmarkList = R.pipe(
      R.values(),
      R.sort(R.descend(R.prop('createdTime'))),
    )(bookmarkList);
    this.setState({
      bookmarkList: _bookmarkList,
      bookmarkListfilter: R.keys(bookmarkList),
    });
  }
  search = (event) => {
    const matchKey = key => item => 
      R.concat(item.book_name, `${item.chapter_nr}:${item.verse_nr}`).indexOf(key) != -1
      || R.concat(item.book_name_short, `${item.chapter_nr}:${item.verse_nr}`).indexOf(key) != -1
      || R.replace(/-/g, '', item.createdTime).indexOf(key) != -1
      || item.createdTime.indexOf(key) != -1
      || R.concat(R.replace(/-/g, '', item.createdTime), `${item.book_name}${item.chapter_nr}:${item.verse_nr}`).indexOf(key) != -1
      || R.concat(item.createdTime, `${item.book_name}${item.chapter_nr}:${item.verse_nr}`).indexOf(key) != -1
      || item.verse.indexOf(key) != -1
      || R.concat(R.replace(/-/g, '', item.createdTime), `${item.book_name_short}${item.chapter_nr}:${item.verse_nr}`).indexOf(key) != -1
      || R.concat(item.createdTime, `${item.book_name_short}${item.chapter_nr}:${item.verse_nr}`).indexOf(key) != -1;
    const find = R.curry((bookmarkList, key) =>
      R.pipe(
        R.filter(matchKey(key)),
        R.map(R.prop('keyId')),
      )(bookmarkList),
    );
    const matchs = find(this.state.bookmarkList, event);
    this.setState({
      searchKey: event,
      bookmarkListfilter: R.isEmpty(event) ? R.map(R.prop('keyId'), this.state.bookmarkList) : matchs.length ? matchs : [],
    });
  }
  refresh = (keyId) => {
    this.setState({
      refreshing: true,
    });
    setTimeout(async () => {
      const bookmarkList = await global.storage.load({key:'@bookmark'});
      const _bookmarkList = R.pipe(
        R.values(),
        R.sort(R.descend(R.prop('createdTime'))),
      )(bookmarkList);
      await this.setState({
        bookmarkList: _bookmarkList,
        bookmarkListfilter: this.state.bookmarkListfilter,
        refreshing: false,
      });
    }, 1000);
  }
  deleteBookmark = async (keyId) => {
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    delete bookmarkList[keyId];
    await global.storage.save({key:'@bookmark', data:bookmarkList, expires: null});
    this.state.bookmarkListfilter = R.without([keyId], this.state.bookmarkListfilter);
  }
  addBookmark = async (item) => {
    this.state.bookmarkListfilter = R.concat([item.keyId], this.state.bookmarkListfilter);
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    const _bookmark = {
      ...bookmarkList,
      [item.keyId]: item,
    }
    await global.storage.save({key: '@bookmark', data: _bookmark, expires: null});
  }
  renderHeader = () => {
    return (
    <View style={{flex:1, width:'100%',height:80, justifyContent:'center', alignItems:'center',marginTop:10, marginBottom:20}}>
      <SearchBar
        platform={`${Platform.OS}`}
        cancelButtonTitle={'Cancel'}
        onChangeText={this.search.bind(this)}
        clearIcon
        lightTheme
        placeholder={`${I18n.t('bookmark_search')}...`}
        round
      />
      {
        R.isEmpty(this.state.bookmarkListfilter) ? 
        <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:10}}>
          <Text style={{fontSize:14, fontWeight:'400'}}>
            {R.replace('bookmark_no_searchKey', this.state.searchKey, I18n.t('bookmark_no_searchKey'))}
          </Text>
        </View>
        :
        <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:10, marginBottom:20}}>
          <Text style={{fontSize:14, fontWeight:'400'}}>
            {R.replace('bookmark_number', this.state.bookmarkListfilter.length, I18n.t('bookmark_number'))}
          </Text>
        </View>
      }
    </View>
    )
  };
  renderItem = ({item, index}) => {
    return (
      <FlatListItem
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
    this.contentView.scrollToOffset({x: 0, y: 0, animated: true});
  }
  _handleScroll = (e) => {
    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
    if(contentOffset.y > 600) this.setState({fullScreenMode: true});
    if(contentOffset.y < 600) this.setState({fullScreenMode: false});
  }
  render() {
    const isMatch = key => item => R.contains(item.keyId, key);
    const bookmarkList = R.curry((bookmarkList, key) =>
      R.pipe(
        R.filter(isMatch(key)),
      )(bookmarkList),
    )(this.state.bookmarkList, this.state.bookmarkListfilter);
    return (
      R.isEmpty(this.state.bookmarkList) ?
      <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:20}}>
        <Text>{I18n.t('bookmark_isempty')}</Text>
      </View>
      :
      <View style={{flex:1, backgroundColor:'#eee'}}>
        <FlatList
          ref={r => this.contentView = r}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh.bind(this)}
            />
          }
          extraData={this.state}
          ListHeaderComponent={this.renderHeader}
          data={bookmarkList}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index}
        />
        <ArrowUpFixedContainer>
          <ArrowUp handeleScrollTop={this._handeleScrollTop} fullScreenMode={true} />
        </ArrowUpFixedContainer>
      </View>
    );
  }
}
