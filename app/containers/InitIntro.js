import React, { Component } from 'react';
import { AppRegistry, Alert, Dimensions, StyleSheet, View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { NavigationActions } from 'react-navigation';
import AppIntro from 'react-native-app-intro';
import { storeSetting } from '../store/index';
import { observer } from "mobx-react";

const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');

@observer
export default class InitIntro extends Component {
  render() {
    const pageArray = new Array(1).fill(1).map((val, i) => {
      return (
        <View style={[styles.slide,{ backgroundColor: '#131721' }]}>
          <View level={5}></View>
          <View level={10}>
            <ImageBackground 
              style={{width: deviceWidth, height:deviceHeight}}
              source={require('../images/intro/intro.jpg')}
              resizeMode="contain"
            >
            <View style={{width:deviceWidth,height:deviceHeight,display:'flex',justifyContent:'center', alignItems:'center'}}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  backgroundColor: '#1E1E1E',
                  padding: 30,
                  borderRadius:10,
                  opacity:0.98,
                }}
                onPress={this.props.handleCloseTourist}
                >
                <Text style={{color: '#eee', opacity:1, fontSize:18, fontWeight:'800'}}>開始使用</Text>
              </TouchableOpacity>
            </View>
            </ImageBackground>
          </View>
        </View>
      );
    });
    return (
      <AppIntro
        onDoneBtnClick={this.doneBtnHandle}
        onSkipBtnClick={this.onSkipBtnHandle}
        showSkipButton={false}
        showDoneButton={false}
        showDots={false}
      >
        {pageArray}
      </AppIntro>
    );
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 15,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});