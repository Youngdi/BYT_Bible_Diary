import React, { Component, PureComponent } from 'react';
import {
  Platform,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Text,
  findNodeHandle,
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

const StyledCheck = styled.View`
  position: absolute;
  top:0;
  left:0;
  right:0;
  background-color: transparent;
  width: ${deviceWidth}px;
  height: ${deviceHeight}px;
`;
const StyledContainer = styled.View`
  margin-top:-60px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: ${deviceWidth}px;
  height: ${deviceHeight}px;
`;
export default class Check extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fadeInOpacity: new Animated.Value(0),
      allowClick: true,
      progress: new Animated.Value(0),
      viewRef: null,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      Animated.timing(this.state.progress, {
        toValue: 1,
        duration: 3000,
      }).start();
    }, 100);
  }
  handleBlur = () => {
    this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
  }
  render() {
    return (
      <StyledContainer>
        <StyledCheck ref={(img) => this.backgroundImage = img} onLayout={this.handleBlur} />
        {this.state.viewRef &&
          <BlurView
            viewRef={this.state.viewRef}
            style={{position: "absolute", top: 0, left: 0, bottom: 0, right: 0}}
            blurType="dark"
            blurAmount={5}
          />
        }
        <TouchableOpacity
          hitSlop={{top: 1000, bottom: 1000, left: 1000, right: 1000}}
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
            }, 100);
          }}
        >
          <LottieView
            style={{width:deviceWidth - 100, height:deviceWidth - 100}}
            progress={this.state.progress}
            source={require('../lottie/done.json')}
          />
        </TouchableOpacity>
        <View style={{marginBottom:250}}>
          <Text style={{fontSize:20, color:'#ccc', fontWeight:'bold', backgroundColor:'transparent'}}>{'   '}{I18n.t('pull_down_congrats')}</Text>
        </View>
      </StyledContainer>
    );
  }
}
