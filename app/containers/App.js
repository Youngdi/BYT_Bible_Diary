import React, { Component } from 'react';
import { Button, ScrollView, Text, View, TouchableOpacity, Animated, StyleSheet, Share, Platform } from 'react-native';
import { SafeAreaView, StackNavigator, TabNavigator, NavigationActions } from 'react-navigation';
import getSlideFromRightTransition from 'react-navigation-slide-from-right-transition';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';
import CodePush from "react-native-code-push";
import DiaryScreen from './DiaryRead';
import I18n, { getLanguages } from 'react-native-i18n';
import moment from 'moment/min/moment-with-locales';
import RNFS from 'react-native-fs';
import Realm from 'realm';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BookmarkScreen from './Bookmark';
import BibleScreen from './Bible';
import MoreScreen from './More';
import NoteScreen from './Note';
import BibleSearchScreen from './BibleSearch';
import { test_db } from '../api/api';
import bibleFlag from '../constants/bible';

Realm.copyBundledRealmFiles();

class MyHomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  getDiaryBiblePhrase = (time) => {
    let number = Math.floor(Math.random() * 74) + 1;
    let bible_number = `B${number}`;
    return `${time}經文-${bibleFlag[bible_number].chapter}\n${bibleFlag[bible_number].verse}`;
  }
  componentDidMount() {
    this.setupScheduleLocalNotification();
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({routeName: 'Diary'}),
      ],
    });
    this.props.navigation.dispatch(resetAction);
    FCM.requestPermissions();
    FCM.getFCMToken().then(token => {
      console.log("TOKEN (getFCMToken)", token);
    });
    FCM.getInitialNotification().then(notif => {
      FCM.setBadgeNumber(0);
      console.log("INITIAL NOTIFICATION", notif)
    });
    this.notificationListener = FCM.on(FCMEvent.Notification, notif => {
      if (Platform.OS == 'ios') {
        if (notif.local_notification) {
          FCM.setBadgeNumber(0);
          this.setupScheduleLocalNotification();
          return;
        } else {
          alert(notif.aps.alert);
        }
    } else {
        alert(notif.fcm.body);
    }
    if(notif.local_notification){
      return;
    }
    if(notif.opened_from_tray){
      return;
    }
    if(Platform.OS ==='ios') {
      switch(notif._notificationType){
        case NotificationType.Remote:
          notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
          break;
        case NotificationType.NotificationResponse:
          notif.finish();
          break;
        case NotificationType.WillPresent:
          notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
          break;
      }
    }
    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
      console.log("TOKEN (refreshUnsubscribe)", token);
    });
  });
    CodePush.sync({ updateDialog: false, installMode: CodePush.InstallMode.IMMEDIATE },
      (status) => {
        switch (status) {
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({showDownloadingModal: false});
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({showInstalling: true});
            break;
          case CodePush.SyncStatus.UPDATE_INSTALLED:
            this.setState({showDownloadingModal: false});
            break;
        }
      },
      ({ receivedBytes, totalBytes, }) => {
          this.setState({downloadProgress: receivedBytes / totalBytes * 100});
      }
    );
  }
  BBB = async () => {
    const d = await test_db();
    alert(d.length);
  }
  setupScheduleLocalNotification = () => {
    // const badgeNumber = await FCM.getBadgeNumber();
    FCM.cancelLocalNotification('nightReminders');
    FCM.cancelLocalNotification('dayReminders');
    FCM.scheduleLocalNotification({
      fire_date: moment(`${moment().format('YYYY-MM-DD')} 08:00:00`).toDate().getTime(),
      id: 'dayReminders',
      title: '早起靈修，開啟你美好的一天',
      body: this.getDiaryBiblePhrase('每日一'),
      priority: 'high', 
      show_in_foreground: true,
      sound: 'default',
      local: true,
      badge: 1,
      vibrate: 500,
      wake_screen: true
    });
    FCM.scheduleLocalNotification({
      fire_date: moment(`${moment().format('YYYY-MM-DD')} 22:00:00`).toDate().getTime(),
      id: 'nightReminders',
      title: '睡前靈修，願主與你一同進入夢鄉',
      body: this.getDiaryBiblePhrase('睡前'),
      priority: 'high', 
      show_in_foreground: true,
      sound: 'default',
      local: true,
      badge: 1,
      vibrate: 500,
      wake_screen: true
    });
  }
  componentWillUnmount() {
    // stop listening for events
    // this.notificationListener.remove();
  }
  render() {
    return (
      <View style={{opacity:1}}>
        <Button title="AAAA" onPress={() => this.props.navigation.navigate('Diary')}></Button>
        <Button title="BBBBB" onPress={() => this.scheduleLocalNotification()}></Button>
      </View>
    );
  }
}
class MyNavScreen extends Component {
  render() {
    return (
      <ScrollView>
        <View>
        </View>
      </ScrollView>
    );
  }
}

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
        title: '',
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
  },
  Bible: {
    screen: BibleScreen,
  },
  Bookmark: {
    screen: BookmarkScreen,
  },
  More: {
    screen: MoreScreen,
  },
  Note: {
    screen: NoteScreen,
  },
  BibleSearch: {
    screen: BibleSearchScreen,
  }
},
  {
    transitionConfig: getSlideFromRightTransition,
    headerMode: 'screen'
  }
);

export default App;