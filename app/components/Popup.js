import React, { Component } from 'react';
import { Button, ScrollView, Text, View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import I18n, { getLanguages } from 'react-native-i18n';
import LottieView from 'lottie-react-native';
import PopupDialog, { SlideAnimation } from 'react-native-popup-dialog';

export default class Popup extends Component {
    constructor(props) {
      super(props);
    }
    popup = () => {
			this.popupDialog.show();
			this.animation.play();
			setTimeout(() => {
					this.popupDialog.dismiss();
			}, 1000);
    }
    render() {
      const slideAnimation = new SlideAnimation({
        slideFrom: 'top',
      });
      return (
        <PopupDialog
          width={0.6}
          height={200}
          overlayOpacity={0}
          dialogStyle={{backgroundColor:'rgba(0,0,0,0.7)', display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center'}}
          ref={(popupDialog) => { this.popupDialog = popupDialog; }}
          dialogAnimation={slideAnimation}
        >
          <View>
            <LottieView
              style={{width:200, height:200, marginTop:-20}}
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