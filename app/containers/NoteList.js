import React, { Component, PureComponent } from "react";
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
  TextInput,
} from "react-native";
import ActionButton from 'react-native-action-button';
import uuidv4 from 'uuid/v4';
import * as R from 'ramda';
import I18n from 'react-native-i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styled from "styled-components/native";
import { SearchBar } from 'react-native-elements';
import ArrowUp from '../components/ArrowUp';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { sperateVerse } from '../api/utilities';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment/min/moment-with-locales';
import striptags from 'striptags';
;
const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 22,
    height: 24,
    color: 'white',
  },
});

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
class FlatListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarkEnable: true,
    }
  }
  render() {
    const {noteId, createdTime, updatedTime, title, content} = this.props.item;
    const noteTitle = (title == null) ? `${I18n.t('noteList_no_name')}`: title;
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
          onPress={() => 
            this.props.navigation.navigate('Note', {
              setting: this.props.setting,
              bg: this.props.bg,
              noteId,
              done: true,
              refresh: this.props.refresh,
            })
          }
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
                {noteTitle}
              </Text>
                <TouchableOpacity
                  hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
                  onPress={() => {
                    Alert.alert(
                      R.replace('noteName', noteTitle, I18n.t('noteList_delete')),
                      '',
                      [
                        {text: `${I18n.t('noteList_delete_no')}`, onPress: () => console.log('Cancel Pressed')},
                        {text: `${I18n.t('noteList_delete_yes')}`, onPress: () => this.props.deleteNote(noteId)},
                      ],
                    )
                  }}
                >
                  <Ionicons color='#ff0000' name='ios-trash-outline' size={30} />
                </TouchableOpacity>
            </View>
            <View>
              <Text numberOfLines={3} style={{ fontSize: 16, fontWeight:'400', lineHeight: 25,marginBottom:10 }}>
              {content == null ? `...` : striptags(content)}
              </Text>
            </View>
            <View style={{display:'flex', justifyContent:'flex-end', flexDirection:'row'}}>
              <Text style={{ fontSize: 14, fontWeight:'200'}}>
                {`${moment(createdTime).format('YYYY-MM-DD')}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
    );
  }
}

export default class NoteList extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const {state, setParams} = navigation;
    return {
      gesturesEnabled: true,
      headerStyle: {
        backgroundColor: state.params.bg,
      },
      title: <StyledHeaderTitle color={state.params.setting.fontColor}>Notes</StyledHeaderTitle>,
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
      noteList: [],
      noteListfilter: [],
      refreshing: false,
      fullScreenMode: false,
      searchKey: '',
    }
  }
  componentDidMount = async () => {
    // this.props.navigation.setParams({ handleRefresh: this.refresh });
    const noteList = await global.storage.load({key:'@note'});
    const _noteList = R.pipe(
      R.values(),
      R.sort(R.descend(R.prop('createdTime'))),
    )(noteList);
    this.setState({
      noteList: _noteList,
      // bookmarkListfilter: R.keys(bookmarkList),
    });
  }
  renderAddNoteButton = () => {
    const {state, setParams} = this.props.navigation;
    return (
      <ActionButton
        buttonColor="rgba(231,76,60,1)"
        onPress={async () => {
            const noteList = await global.storage.load({key:'@note'});
            const noteId = uuidv4();
            const newNoteList = {
              ...noteList,
              [noteId]: {
                noteId,
                createdTime: new Date(),
                title: null,
                content: null,
              }
            };
            await global.storage.save({
              key: '@note',
              data: newNoteList,
              expires: null,
            });
            setTimeout(() => {
              this.props.navigation.navigate('Note', {
                setting: state.params.setting,
                bg: state.params.bg,
                noteId,
                done: true,
                refresh: this.refresh,
              });
            }, 0);
          }
        }
        renderIcon={() => <MaterialIcons name="mode-edit" style={styles.actionButtonIcon}/>}
      >
      </ActionButton>
    );
  }
  renderItem = ({item, index}) => {
    const { setting, bg } = this.props.navigation.state.params;
    return (
      <FlatListItem
        key={item.noteId}
        item={item}
        index={index}
        navigation={this.props.navigation}
        refresh={this.refresh}
        deleteNote={this.deleteNote}
        setting={setting}
        bg={bg}
      />
    );
  }
  refresh = async () => {
    const noteList = await global.storage.load({key:'@note'});
    const _noteList = R.pipe(
      R.values(),
      R.sort(R.descend(R.prop('updatedTime'))),
    )(noteList);
    this.setState({
      noteList: _noteList,
    });
  }
  deleteNote = async (noteId) => {
    const noteList = await global.storage.load({key:'@note'});
    delete noteList[noteId];
    await global.storage.save({
      key: '@note',
      data: noteList,
      expires: null,
    });
    await this.refresh();
  }
  render() {
    const {state, setParams} = this.props.navigation;
    const noteList = this.state.noteList;
    return (
      R.isEmpty(noteList) ?
      <View style={{flex:1, justifyContent:'flex-start', alignItems:'center', marginTop:20}}>
        <Text>{I18n.t('noteList_isempty')}</Text>
        {this.renderAddNoteButton()}
      </View>
      :
      <View style={{flex:1, backgroundColor:'#eee'}}>
        <FlatList
          ref={r => this.contentView = r}
          extraData={this.state}
          // ListHeaderComponent={this.renderHeader}
          data={noteList}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => item.noteId}
        />
        {this.renderAddNoteButton()}
      </View>
    );
  }
}
