import React, { Component } from 'react';
import { View, Dimensions, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';
import styled from "styled-components/native";
import ModalWrapper from 'react-native-modal-wrapper';
import I18n from 'react-native-i18n';

const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

const Container = styled.View`
  background-color: white;
  padding: 10px;
  justify-content: flex-end;
  align-items: center;
  borderTopWidth: 1px;
  border-color: rgba(0, 0, 0, 0.5);
`;
const TooltipRow = styled.View`
  margin:10px;
  width:100%;
  display:flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const TooltipText = styled.Text`
  fontWeight: 400;
  color: #333;
`;
const HighlightRow = styled.View`
  margin:10px;
  width:100%;
  display:flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;
const CloseRow = styled.View`
  margin:8px;
  width:100%;
  display:flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
export default class Tooltip extends Component {
  render() {
    return (
      <ModalWrapper
        isNative={false}
        onRequestClose={() => null}
        position='bottom'
        shouldAnimateOnRequestClose={true}
        showOverlay={false}
        visible={this.props.isTooltipModalVisible}>
        <Container>
          <TooltipRow>
            <View style={{display:'flex', flexDirection: 'row'}}>
              <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} style={{marginLeft:30, marginRight:25}}>
                <TooltipText onPress={() => this.props.handleBookmark()}>{I18n.t('bookmark')}</TooltipText>
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} style={{marginRight:25}}>
                <TooltipText onPress={() => this.props.handleCopyVerse()}>{I18n.t('copy_verse')}</TooltipText>
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <TooltipText>{I18n.t('share_verse')}</TooltipText>
              </TouchableOpacity>
            </View>
            <View style={{display:'flex', flexDirection: 'row', justifyContent:'flex-end', alignItems:'flex-end'}}>
              <TouchableOpacity
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => this.props.handleHighlight('#1A8B9D')}
                style={{marginRight:13, backgroundColor:'#1A8B9D', width: 36, height: 36, borderColor:'#1A8B9D', borderWidth:4, borderStyle:'solid', borderRadius: 18}}
              />
              <TouchableOpacity
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => this.props.handleHighlight('#388E3C')}
                style={{marginRight:13, backgroundColor:'#388E3C', width: 36, height: 36, borderColor:'#388E3C', borderWidth:4, borderStyle:'solid', borderRadius: 18}}
              />
              <TouchableOpacity
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => this.props.handleHighlight('transparent')}
                style={{marginRight:13, backgroundColor:'#fff', width: 36, height: 36, borderColor:'black', borderWidth:0.5, borderStyle:'solid', borderRadius: 18}}
              />
            </View>
          </TooltipRow>
          <CloseRow>
            <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <TooltipText onPress={() => this.props.closeTooltip()}>{I18n.t('close_tooltip')}</TooltipText>
            </TouchableOpacity>
          </CloseRow>
      </Container>
    </ModalWrapper>
    );
  }
}
