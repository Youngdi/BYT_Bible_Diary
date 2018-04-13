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
  FlatList,
} from 'react-native';
import * as R from 'ramda';
import moment from 'moment/min/moment-with-locales';
import styled from "styled-components/native";
import { isIphoneX } from 'react-native-iphone-x-helper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { bookName } from '../constants/bible';
import Verse from './Verse';
import {checkVerseSelected, checkVerseHighlighted} from '../api/tooltip';
import { storeSetting } from '../store/index';
import { observer, Observer } from "mobx-react";
import I18n from 'react-native-i18n';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const StyledMainContainer = styled.View`
  margin-left:30px;
  margin-right:30px;
`;
const StyledBibleContainer = styled.View`
  margin-left:30px;
  margin-right:30px;
`;
const Title = styled.Text`
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
  margin-bottom:10px;
`;
const PharseCantainer = styled.Text`
  font-size: ${props => props.fontSize}px;
  color: ${props => props.fontColor};
  line-height: ${props => props.lineHeight};
  font-family: ${props => props.fontFamily};
  font-weight: 300;
`;
const PharseNumber = styled.Text`
  font-size: ${props => props.fontSize}px;
  margin-top: -10px;
  margin-right: 5px;
`;
@observer
export default class DiaryContent extends Component {
  renderDiaryTitle = () => {
    const renderDay = () =>
      <TouchableOpacity
        onPress={() => this.props.marked && this.props.handleUnmarkDate()}
        style={{borderLeftWidth:8, paddingLeft:10, borderColor: this.props.marked ? '#F7B633' : '#CF0A2C'}}
      >
        <Title
          fontColor={storeSetting.fontColor}
          fontFamily={storeSetting.fontFamily}
        >
        {`${this.props.date.month}${I18n.t('month')}${this.props.date.day}${I18n.t('day')}`}
        </Title>
      </TouchableOpacity>
    const renderAnchor = () =>
      this.props.content.map( (item, i) => {
        return(
          <TouchableOpacity
            key={`${item[0].version}-${item[0].book_name_short}${item[0].chapter_nr}`}
            style={{height:40, display:'flex', justifyContent:'flex-end', borderBottomWidth: 1, borderBottomColor:'#0881A3', paddingBottom:1}}
            hitSlop={{top: 40, bottom: 40, left: 10, right: 10}}
            onPress={(e) => {
              this.props.closeActionButton();

              this[item[0].book_name + item[0].chapter_nr].measure((x, y, width, height, pageX, pageY) => {
                this.props.contentView.root.scrollTo({y: pageY, animated: true});
                this.props.setFullScreenMode();
              });
            }}
          >
            <Text style={{fontSize:12, color: '#0881A3'}}>
              {`${item[0].book_name_short}${item[0].chapter_nr}`}
            </Text>
          </TouchableOpacity>
        );
      })
    return (
      <View style={{display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between', marginTop:20}}>
        {renderDay()}
        {renderAnchor()}
      </View>
    );
  }
  renderItem = (item, i) => {
    return (
      <Observer>
      {() => 
        <View>
          <BookTitle
            fontSize={storeSetting.fontSize + 2}
            fontColor={storeSetting.fontColor}
            lineHeight={storeSetting.lineHeight}
            fontFamily={storeSetting.fontFamily}
          >
          {i ? '': '\n'}{'\n'}{`${item[0].book_name}${item[0].chapter_nr}:${item[0].verse_nr}${item.length == 1 ? '' : '-' + item[item.length -1].verse_nr}`}
          </BookTitle>
          <PharseCantainer
            fontSize={storeSetting.fontSize}
            fontColor={storeSetting.fontColor}
            lineHeight={storeSetting.lineHeight}
            fontFamily={storeSetting.fontFamily}
          >
          {item.map((verseItem, i) => {
            return(
              <Verse
                fontSize={storeSetting.fontSize}
                fontColor={storeSetting.fontColor}
                lineHeight={storeSetting.lineHeight}
                verseItem={verseItem}
                language={storeSetting.language}
                handleVerseClick={this.props.handleVerseClick}
                selected={checkVerseSelected(this.props.selectVerse, `${verseItem.id}-${verseItem.version}`)}
                highlightColor={checkVerseHighlighted(this.props.highlightList, verseItem)}
              />
            );
          })}
          </PharseCantainer>
        </View>
      }
      </Observer>
    );
  }
  renderDiaryVerse = () => this.props.content.map((item, i) =>
    <View collapsable={false} ref={r => this[item[0].book_name + item[0].chapter_nr] = r}>
      <FlatList
        data={[item]}
        renderItem={({item}) => this.renderItem(item, i)}
        keyExtractor={(item, index) => index}
      />
    </View>
  );
  renderFinishText = () => {
    if(this.props.content.length == 0) return;
    return(
      this.props.marked ? 
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:100, marginTop:30}}>
        <Text style={{color:storeSetting.fontColor, fontFamily:storeSetting.fontFamily}}>{I18n.t('finishe_today')}</Text>
      </View> :
      <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', height:200, marginTop:30}}>
        <Text style={{color:storeSetting.fontColor, fontFamily:storeSetting.fontFamily}}>{I18n.t('pull_down_to_finish')}</Text>
        <MaterialCommunityIcons
          style={{marginTop:20}}
          name='arrow-expand-up'
          size={30}
          color={`${storeSetting.fontColor}`}
        />
      </View>
    );
  }
  renderDiary = () => {
    return (
      <StyledMainContainer>
        {this.renderDiaryTitle()}
        {this.renderDiaryVerse()}
        {this.renderFinishText()}
      </StyledMainContainer>
    )
  }
  render() {
    return (
      this.renderDiary()
    );
  }
}
