import React, { Component } from 'react';
import { AppRegistry, Alert, Dimensions, StyleSheet, View, Text, Image } from 'react-native';
import AppIntro from 'react-native-app-intro';
const {
  height: deviceHeight,
  width: deviceWidth
} = Dimensions.get('window');
const getImage = (id) => {
  switch (id) {
      case 1:
        return require('../images/intro/intro_1.jpg');
      case 2:
        return require('../images/intro/intro_2.jpg');
      case 3:
        return require('../images/intro/intro_3.jpg');
      case 4:
        return require('../images/intro/intro_4.jpg');
      case 5:
        return require('../images/intro/intro_5.jpg');
      case 6:
        return require('../images/intro/intro_6.jpg');
      case 7:
        return require('../images/intro/intro_7.jpg');
      case 8:
        return require('../images/intro/intro_8.jpg');
      case 9:
        return require('../images/intro/intro_9.jpg');
      case 10:
        return require('../images/intro/intro_10.jpg');
      case 11:
        return require('../images/intro/intro_11.jpg');
      default:
        return require('../images/intro/intro_1.jpg');
  }
};
export default class Intro extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
      gesturesEnabled: true,
    };
  };
  onSkipBtnHandle = (index) => {
    this.props.navigation.goBack();
  }
  doneBtnHandle = () => {
    this.props.navigation.goBack();
  }
  render() {
    const pageArray = new Array(11).fill(1).map((val, i) => {
      return (
        <View style={[styles.slide,{ backgroundColor: '#131721' }]}>
          <View level={5}></View>
          <View level={10}>
            <Image 
              style={{width: deviceWidth, height:deviceHeight}}
              source={getImage(i + 1)}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    });
    return (
      <AppIntro
        onDoneBtnClick={this.doneBtnHandle}
        onSkipBtnClick={this.onSkipBtnHandle}
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