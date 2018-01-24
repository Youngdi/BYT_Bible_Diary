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
import LottieView from 'lottie-react-native';
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
      allowClick: true,
      progress: new Animated.Value(0),
    };
  }
  render() {
    if(this.props.content.length == 0) return (<View></View>);
    if(this.props.finishedReading){
      this.animation.play();
    }
    Animated.timing(this.state.progress, {
      toValue: 1,
      duration: 5000,
    }).start();
    return (
      this.props.finishedReading ?
      <StyledCheck>
        <BlurView
          ref="ANBlurView"
          style={{position: "absolute", top: 0, left: 0, bottom: 0, right: 0}}
          blurType="dark"
          blurAmount={5}
        />
        <TouchableOpacity
          hitSlop={{top: 1000, bottom: 1000, left: 1000, right: 1000}}
          style={{marginBottom:20}}
          onPress={() => {
            if(!this.state.allowClick) return;
            this.setState({
              allowClick: false,
            })
            setTimeout(() => {
              this.setState({
                allowClick: true,
              });
              this.props.handleFinished();
            }, 900);
          }}
        >
          <LottieView
            style={{width:250, height:250}}
            ref={animation => {
              this.animation = animation;
            }}
            progress={this.state.progress}
            source={require('../lottie/check.json')}
          />
        </TouchableOpacity>
        <View style={{marginBottom:150}}>
          <Text style={{fontSize:20, color:'#ccc', fontWeight:'bold', backgroundColor:'transparent'}}>{'   '}{I18n.t('pull_down_congrats')}</Text>
        </View>
      </StyledCheck>
      : <View></View>
    );
  }
}
