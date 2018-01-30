import React, { Component } from "react";
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  Alert,
} from "react-native";
import Swipeout from "react-native-swipeout";
import * as R from 'ramda';
import I18n from 'react-native-i18n';
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
            borderBottomWidth:1,
            borderBottomColor:'white',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              backgroundColor: "mediumseagreen"
            }}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight:'400' }}>
                {`${createdTime}`}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight:'400' }}>
                {`${book_name}${chapter_nr}:${verse_nr}:『${verse}』`}
              </Text>
            </View>
          </View>
        </View>
      </Swipeout>
    );
  }
}

export default class Bookmark extends Component {
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: '書籤',
      gesturesEnabled: true,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      bookmarkList: [],
    }
  }
  componentDidMount = async () => {
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    const _bookmarkList = R.pipe(
      R.values(),
      R.sort(R.descend(R.prop('createdTime'))),
    )(bookmarkList);
    this.setState({
      bookmarkList: _bookmarkList,
    });
  }
  refresh = async () => {
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    const _bookmarkList = R.pipe(
      R.values(),
      R.sort(R.descend(R.prop('createdTime'))),
    )(bookmarkList);
    this.setState({
      bookmarkList: _bookmarkList,
    });
  }
  deleteBookmark = async (item) => {
    const {id, version, testament, book_ref, book_name, book_name_short, book_nr, chapter_nr, verse_nr, verse, createdTime, keyId} = item;
    const bookmarkList = await global.storage.load({key:'@bookmark'});
    delete bookmarkList[keyId];
    await global.storage.save({key:'@bookmark', data:bookmarkList});
    this.refresh();
  }
  render() {
    return (
      R.isEmpty(this.state.bookmarkList) ?
      <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:20}}>
        <Text>{I18n.t('bookmark_isempty')}</Text>
      </View>
      :
      <View style={{flex:1}}>
        <FlatList
          data={this.state.bookmarkList}
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
