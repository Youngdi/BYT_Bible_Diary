import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styled from "styled-components/native";
import { BlurView, VibrancyView } from 'react-native-blur';
import * as Animatable from 'react-native-animatable';
const ANFontAwesome = Animatable.createAnimatableComponent(FontAwesome);
import I18n from 'react-native-i18n';

const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const StyledCheck = Animated.createAnimatedComponent(styled.View`
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${deviceWidth}px
  height: ${deviceHeight}px;
`)

export default class Check extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
    };
  }
  render() {
    if(this.props.content.length == 0) return (<View></View>);
    return (
      this.props.finishedReading ? 
      <StyledCheck>
        <BlurView
          ref="ANBlurView"
          style={{position: "absolute", top: 0, left: 0, bottom: 0, right: 0}}
          blurType="dark"
          blurAmount={5}
        />
        <Animatable.View
          animation="zoomIn"
          delay={500}
          style={{backgroundColor:'#fff', width: 90, height: 90, borderColor:'#fff', borderWidth:6, borderStyle:'solid', borderRadius: 45, marginBottom:20}}
          duration={1500}
          ref="ANFontAwesomeView"
          easing="ease-out"
        >
          <TouchableOpacity
            hitSlop={{top: 1000, bottom: 1000, left: 1000, right: 1000}}
            onPress={() => {
              this.refs.ANFontAwesomeView.zoomOut(800);
              setTimeout(() => {
                this.props.handleFinished();
              }, 900);
            }}
          >
            <FontAwesome
              name='calendar-check-o'
              size={50}
              color="#111"
              style={{backgroundColor:'transparent', marginLeft:16, marginTop:12}}
            />
          </TouchableOpacity>
        </Animatable.View>
        <View style={{marginBottom:150}}>
         <Text style={{fontSize:20, color:'#ccc', fontWeight:'bold', backgroundColor:'transparent'}}>{'   '}{I18n.t('pull_down_congrats')}</Text>
        </View>
      </StyledCheck>
      : <View></View>
    );
  }
}
