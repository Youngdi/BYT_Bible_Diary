import React, { Component, PureComponent } from 'react';
import { Button, ScrollView, Text, View, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import I18n, { getLanguages } from 'react-native-i18n';
import LottieView from 'lottie-react-native';
import PopupDialog, { SlideAnimation, FadeAnimation } from 'react-native-popup-dialog';

export default class Popup extends PureComponent {
    constructor(props) {
      super(props);
    }
    popup = () => {
			this.popupDialog.show();
			this.animation.play();
			setTimeout(() => {
        if(this.popupDialog) this.popupDialog.dismiss();
			}, 2000);
    }
    render() {
      const fadeAnimation = new FadeAnimation({
        animationDuration: 800,
      });
      return (
        <PopupDialog
          width={0.6}
          height={200}
          overlayOpacity={0}
          dialogStyle={{backgroundColor:'rgba(0,0,0,0.7)', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop:this.props.marginAdjust}}
          ref={(popupDialog) => { this.popupDialog = popupDialog; }}
          dialogAnimation={fadeAnimation}
        >
          <View>
            <LottieView
              style={{width:200, height:200, marginTop:Platform.OS == 'ios' ? -20 : -40}}
              ref={animation => this.animation = animation}
              source={require('../lottie/checked_done_.json')}
            />
            <View style={{display:'flex', flexDirection:'row', justifyContent:'center', marginTop:-60}}>
              <Text style={{color:'white', fontWeight:'800'}}>{this.props.text}</Text>
            </View>
          </View>
        </PopupDialog>
      );
    }
  }