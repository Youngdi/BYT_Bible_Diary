import React, { Component } from "react";
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Alert,
  Dimensions,
} from "react-native";
import Swipeout from "react-native-swipeout";
import * as R from 'ramda';
import I18n from 'react-native-i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styled from "styled-components/native";
import { Makiko, Sae } from 'react-native-textinput-effects';
import { SearchBar } from 'react-native-elements'

const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const StyledHeaderTitle = styled.Text`
  font-size:20;
  font-family: 'Times New Roman';
  font-weight: 900;
`;
class FlatListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRowKey: null,
    }
  }
  render() {
    const {id, version, testament, book_ref, book_name, book_name_short, book_nr, chapter_nr, verse_nr, verse, createdTime, keyId} = this.props.item;
    const swipeSettings = {
      backgroundColor: '#eee',
      autoClose: true,
      onClose: (secId, rowId, direction) => {
        if(this.state.activeRowKey != null){
          this.setState({activeRowKey: null});
        }
      },
      onOpen: (secId, rowId, direction) => {
        this.setState({activeRowKey: this.props.item.keyId});
      },
      right: [
        {
          onPress: () => {
            Alert.alert(
              'Alert',
              'Are you sure you want to delete ?',
              [
                {text: 'No', onPress: () => console.log('cancel pressed'), style:'cancel'},
                {text: 'Yes', onPress: () => {
                  this.props.deleteBookmark(this.props.item);
                }},
              ],
              {cancelable: true}
            )
          },
          text: 'Delete', type: 'delete',
        }
      ],
      rowId: this.props.index,
      sectionId: 1,
    };
    return (
      <Swipeout {...swipeSettings}>
        <View
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
            <View style={{marginBottom:10}}>
              <Text style={{ fontSize: 18, fontWeight:'800' }}>
                {`${book_name}${chapter_nr}:${verse_nr}`}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight:'400', lineHeight: 25,marginBottom:10 }}>
                {`${verse}`}
              </Text>
            </View>
            <View style={{display:'flex', justifyContent:'flex-end', flexDirection:'row'}}>
              <Text style={{ fontSize: 14, fontWeight:'200' }}>
                {`${createdTime}`}
              </Text>
            </View>
          </View>
        </View>
      </Swipeout>
    );
  }
}

export default class Bookmark extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const {state, setParams} = navigation;
    return {
      headerTintColor: '#333',
      title: <StyledHeaderTitle>Bookmarks</StyledHeaderTitle>,
      gesturesEnabled: true,
      headerRight:<Sae
                    onChangeText={(e) => state.params.handleSearch(e)}
                    height={33}
                    style={{width:deviceWidth - 290,marginRight:18,marginTop:-23}}
                    iconClass={Ionicons}
                    iconName={'ios-search-outline'}
                    iconColor={'#333'}
                    iconSize={20}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    inputStyle={{ color: '#333', fontSize:14}}
                  />
      ,headerLeft: <Ionicons
                      onPress={() => navigation.goBack()}
                      style={{marginLeft:15}}
                      name='ios-arrow-back-outline'
                      size={30}
                      color='#333' 
                    />
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      bookmarkList: [],
      bookmarkListfilter: [],
    }
  }
  componentDidMount = async () => {
    this.props.navigation.setParams({ handleSearch: this.search });
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
  refresh = async (keyId) => {
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    const _bookmarkList = R.pipe(
      R.values(),
      R.sort(R.descend(R.prop('createdTime'))),
    )(bookmarkList);
    this.setState({
      bookmarkList: _bookmarkList,
      bookmarkListfilter: R.without([keyId], this.state.bookmarkListfilter),
    });
  }
  deleteBookmark = async (item) => {
    const {id, version, testament, book_ref, book_name, book_name_short, book_nr, chapter_nr, verse_nr, verse, createdTime, keyId} = item;
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    delete bookmarkList[keyId];
    await global.storage.save({key:'@bookmark', data:bookmarkList});
    this.refresh(keyId);
  }
  renderHeader = () => {
    return <View style={{flex:1, height:30, justifyContent:'center', alignItems:'center', margin:10}}><Text style={{fontSize:14, fontWeight:'400'}}>{`目前書籤經文有${this.state.bookmarkListfilter.length}個`}</Text></View>
  };
  render() {
    const isMatch = item => R.contains(item.keyId, this.state.bookmarkListfilter);
    const bookmarkList = R.filter(isMatch, this.state.bookmarkList);
    return (
      R.isEmpty(this.state.bookmarkList) ?
      <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:20}}>
        <Text>{I18n.t('bookmark_isempty')}</Text>
      </View>
      :
      R.isEmpty(this.state.bookmarkListfilter) ? 
      <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:20}}>
        <Text>{`沒有${this.state.searchKey}的書籤`}</Text>
      </View>
      :
      <View style={{flex:1, backgroundColor:'#eee'}}>
        <FlatList
          ListHeaderComponent={this.renderHeader}
          data={bookmarkList}
          renderItem={ ({item, index}) => {
            return (
              <FlatListItem deleteBookmark={this.deleteBookmark} refresh={this.refresh} item={item} index={index}/>
            );
          }}
        />
      </View>
    );
  }
}
