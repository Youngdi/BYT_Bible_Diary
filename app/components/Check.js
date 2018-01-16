import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styled from "styled-components/native";
import { BlurView, VibrancyView } from 'react-native-blur';
import * as Animatable from 'react-native-animatable';
const ANFontAwesome = Animatable.createAnimatableComponent(FontAwesome);

const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

const StyledCheck = Animated.createAnimatedComponent(styled.View`
  z-index: 10;
  position: absolute;
  display: flex;
  flex-direction: row;
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
          style={{backgroundColor:'#fff', width: 90, height: 90, borderColor:'#fff', borderWidth:6, borderStyle:'solid', borderRadius: 45, marginBottom:250}}
          duration={2000}
          ref="ANFontAwesomeView"
          easing="ease-out"
        >
          <FontAwesome
            onPress={() => {
              this.refs.ANFontAwesomeView.zoomOut(800);
              setTimeout(() => {
                this.props.handleFinished();
              }, 1000);
            }}
            name='calendar-check-o'
            size={50}
            color="#111"
            style={{backgroundColor:'transparent', marginLeft:16, marginTop:12}}
          />
         </Animatable.View>
      </StyledCheck>
      : <View></View>
    );
  }
}
