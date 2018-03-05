import React, { Component } from 'react';
import { Button, ScrollView, Text, View, TouchableOpacity, Animated, StyleSheet, Share, Platform } from 'react-native';
import { SafeAreaView, StackNavigator, TabNavigator } from 'react-navigation';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';
import CodePush from "react-native-code-push";
import DiaryScreen from './DiaryRead';
import I18n, { getLanguages } from 'react-native-i18n';
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
Realm.copyBundledRealmFiles();

class MyHomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.navigation.navigate('Diary');
    FCM.requestPermissions();
    FCM.getFCMToken().then(token => {
      console.log("TOKEN (getFCMToken)", token);
    });
    FCM.getInitialNotification().then(notif => {
      console.log("INITIAL NOTIFICATION", notif)
    });
    this.notificationListener = FCM.on(FCMEvent.Notification, notif => {
      if (Platform.OS == 'ios') {
        if (notif.local_notification){
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
    // setTimeout(() => {
    //   FCM.presentLocalNotification({
    //     id: "UNIQ_ID_STRING",                               // (optional for instant notification)
    //     title: "大會通知",                     // as FCM payload
    //     body: '555555555',                    // as FCM payload (required)
    //     sound: "default",                                   // as FCM payload
    //     priority: "high",                                   // as FCM payload
    //     click_action: "ACTION",                             // as FCM payload
    //     badge: 0,                                           // as FCM payload IOS only, set 0 to clear badges
    //     icon: "ic_launcher",                                // as FCM payload, you can relace this with custom icon you put in mipmap
    //     my_custom_data:'my_custom_field_value',             // extra data you want to throw
    //     show_in_foreground:true                             // notification when app is in foreground (local & remote)
    //   });
    // }, 5000);
  }
  BBB = async () => {
    const d = await test_db();
    alert(d.length);
  }
  componentWillUnmount() {
    // stop listening for events
    this.notificationListener.remove();
  }
  render() {
    return (
      <View style={{opacity:0}}>
        <Button title="AAAA" onPress={() => this.props.navigation.navigate('Diary')}></Button>
        <Button title="BBBBB" onPress={() => this.BBB()}></Button>
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
    headerMode: 'screen'
  }
);

export default App;