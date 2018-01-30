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

class FlatListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRowKey: null,
    }
  }
  render() {
    const {id, version, testament, book_ref, book_name, book_name_short, book_nr, chapter_nr, verse_nr, verse, createdTime} = this.props.item;
    const swipeSettings = {
      autoClose: true,
      onClose: (secId, rowId, direction) => {
        // if(this.state.activeRowKey != null){
        //   this.setState({activeRowKey: null});
        // }
      },
      onOpen: (secId, rowId, direction) => {
        //this.setState({activeRowKey: this.props.item.key});
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
                  //flatListData.splice(this.props.index, 1)
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
  render() {
    return (
      <View style={{flex:1}}>
        <FlatList
          data={this.state.bookmarkList}
          renderItem={ ({item, index}) => {
            return (
              <FlatListItem item={item} index={index}/>
            );
          }}
        />
      </View>
    );
  }
}
