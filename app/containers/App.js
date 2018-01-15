import React, { Component } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, StackNavigator, TabNavigator } from 'react-navigation';
import DiaryScreen from './DiaryRead';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SQLite from 'react-native-sqlite-storage';
// SQLite.DEBUG(true);
SQLite.enablePromise(true);
class MyHomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount = async () => {
    const bibleDB = await SQLite.openDatabase({name : "Bible.db", createFromLocation : "1"});
    const bible2DB = await SQLite.openDatabase({name : "Bible2.db", createFromLocation : "1"});
    const scheduleDB = await SQLite.openDatabase({name : "BibleSchedule.db", createFromLocation : "1"});
    this.db = {
      bibleDB,
      bible2DB,
      scheduleDB
    }
  }
  render() {
    return (
      <View>
        <Button title="讀經去" onPress={() => this.props.navigation.navigate('Diary', { db: this.db})}/>
      </View>
    );
  }
}

const MyNavScreen = ({ navigation, banner }) => (
  <ScrollView>
    <SafeAreaView forceInset={{ horizontal: 'always' }}>
      <Text>{'banner'}</Text>
      <Button
        onPress={() => navigation.navigate('Profile', { name: 'Jordan' })}
        title="Open profile screen"
      />
      <Button
        onPress={() => navigation.navigate('NotifSettings')}
        title="Open notifications screen"
      />
      <Button
        onPress={() => navigation.navigate('SettingsTab')}
        title="Go to settings tab"
      />
      <Button onPress={() => navigation.goBack(null)} title="Go back" />
    </SafeAreaView>
  </ScrollView>
);

const MyProfileScreen = ({ navigation }) => (
  <MyNavScreen
    banner={`${navigation.state.params.name}s Profile`}
    navigation={navigation}
  />
);

const MyNotificationsSettingsScreen = ({ navigation }) => (
  <MyNavScreen banner="Notifications Screen" navigation={navigation} />
);

const MySettingsScreen = ({ navigation }) => (
  <MyNavScreen banner="Settings Screen" navigation={navigation} />
);

const TabNav = TabNavigator(
  {
    MainTab: {
      screen: MyHomeScreen,
      path: '/',
      navigationOptions: {
        title: 'Welcome',
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? 'ios-home' : 'ios-home-outline'}
            size={26}
            style={{ color: tintColor }}
          />
        ),
      },
    },
    SettingsTab: {
      screen: MySettingsScreen,
      path: '/settings',
      navigationOptions: {
        title: 'Settings',
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? 'ios-settings' : 'ios-settings-outline'}
            size={26}
            style={{ color: tintColor }}
          />
        ),
      },
    },
  },
  {
    tabBarPosition: 'bottom',
    animationEnabled: true,
    swipeEnabled: true,
  }
);

const App = StackNavigator(
{
  Root: {
    screen: TabNav,
  },
  NotifSettings: {
    screen: MyNotificationsSettingsScreen,
    navigationOptions: {
      title: 'Notifications',
    },
  },
  Profile: {
    screen: MyProfileScreen,
    navigationOptions: ({ navigation }) => {
      title: `${navigation.state.params.name}'s Profile!`;
    },
  },
  Diary: {
    screen: DiaryScreen,
  }
},
  {
    headerMode: 'screen'
  }
);

export default App;