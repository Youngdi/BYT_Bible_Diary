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
import * as R from 'ramda';
import I18n from 'react-native-i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styled from "styled-components/native";
import { SearchBar } from 'react-native-elements';
import {RichTextEditor, RichTextToolbar} from 'react-native-zss-rich-text-editor';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import moment from 'moment/min/moment-with-locales';

const StyledHeaderTitle = styled.Text`
  color: ${props => props.color};
  font-size:20;
  font-family: 'Times New Roman';
  font-weight: 900;
`;
const StyledDoneText = styled.Text`
  color: ${props => props.color};
  font-weight: 600;
  font-size:14;
`;
const StyledContainer = styled.View`
  flex: 1;
  flex-direction: column;
  padding-top: 20px;
`;
export default class Note extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const {state, setParams} = navigation;
    return {
      gesturesEnabled: true,
      headerStyle: {
        backgroundColor: state.params.bg,
      },
      title: <StyledHeaderTitle color={state.params.setting.fontColor}>{`${state.params.currentDate} QT`}</StyledHeaderTitle>,
      headerLeft: <TouchableOpacity
                    hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                    onPress={() => {
                      state.params.saveNote();
                      navigation.goBack();
                    }}
                    >
                    <Ionicons style={{marginLeft:15}} name='ios-arrow-back-outline' size={30} color={state.params.setting.fontColor} />
                    </TouchableOpacity>
      ,headerRight: <TouchableOpacity
                      hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                      onPress={() => {
                        state.params.saveNote();
                        state.params.hideToolbar();
                        state.params.richtext.blurContentEditor();
                        state.params.richtext.blurTitleEditor();
                      }}
                      style={{marginRight:15}}
                    >
                      {state.params.done ? null : <StyledDoneText color={state.params.setting.fontColor}>完成</StyledDoneText>}
                    </TouchableOpacity>
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      title: null,
      titlePlaceholder: `${I18n.t('note_title_placeholder')}`,
      contentPlaceholder: `${I18n.t('note_content_placeholder')}`,
      content: null,
      currentDate: '',
    }
    this.saveNote = this.saveNote.bind(this);
    this.setFocusHandlers = this.setFocusHandlers.bind(this);
    this.initData();
  }
  initData = async () => {
    const noteList = await global.storage.load({key:'@note'});
    const note = R.path([this.props.navigation.state.params.currentDate], noteList);
    this.setState({
      title: note ? note.title: this.state.title,
      content: note ? note.content: this.state.content,
      currentDate: this.props.navigation.state.params.currentDate,
      hideToolbar: false,
    });
  }
  componentDidMount() {
    this.props.navigation.setParams({
      saveNote: this.saveNote,
      hideToolbar: this.hideToolbar,
      richtext : this.richtext,
    });
  }
  render() {
    let customCSS = 'body {background-color:#fff, color: #000}';
    if(this.props.navigation.state.params.setting.readingMode) {
      customCSS = `body {background-color:#333, color: #ccc}`;
    } else {
      customCSS = `body {background-color:#fff, color: #000}`;
    }
    return (
        <StyledContainer>
          <RichTextEditor
              ref={ (r) => this.richtext = r}
              style={styles.richText}
              titlePlaceholder={this.state.titlePlaceholder}
              contentPlaceholder={this.state.contentPlaceholder}
              initialTitleHTML={this.state.title}
              initialContentHTML={this.state.content}
              editorInitializedCallback={() => this.onEditorInitialized()}
          />
          {
            this.state.hideToolbar ? null :<RichTextToolbar getEditor={() => this.richtext} />
          }
          {Platform.OS === 'ios' && <KeyboardSpacer/>}
        </StyledContainer>
    );
  }
  onEditorInitialized() {
    this.setFocusHandlers();
  }
  hideToolbar = () => {
    this.props.navigation.setParams({
      done: true,
    });
    this.setState({
      hideToolbar: true,
    });
  }
  async saveNote() {
    const title = await this.richtext.getTitleText();
    const contentHtml = await this.richtext.getContentHtml();
    const noteList = await global.storage.load({key:'@note'});
    const currentNote = {
      ...noteList,
      [this.state.currentDate]: {
        title: title,
        content: contentHtml,
      }
    };
    await global.storage.save({
      key: '@note',
      data: currentNote,
      expires: null,
    });
  }
  setFocusHandlers() {
    this.richtext.setTitleFocusHandler(() => {
      this.props.navigation.setParams({
        done: false,
      });
      this.setState({
        hideToolbar: false,
      });
    });
    this.richtext.setContentFocusHandler(() => {
      this.props.navigation.setParams({
        done: false,
      });
      this.setState({
        hideToolbar: false,
      });
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingTop: 10
  },
  richText: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});