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


const bible_chs = {
  name: 'bible_chs',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const bible_cht = {
  name: 'bible_cht',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const bible_japan = {
  name: 'bible_japan',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const bible_kjv = {
  name: 'bible_kjv',
  primaryKey: 'id',
  properties: {
    id: 'int',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?',
    highlight_color: 'string?'
  }
}
const schedule = {
  name: 'schedule',
  primaryKey: 'id',
  properties: {
    id: 'int?',
    month: 'int?',
    day: 'int?',
    book_id: 'int?',
    chapter_from: 'int?',
    verse_from: 'int?',
    chapter_to: 'int?',
    verse_to: 'int?'
  }
}
Realm.copyBundledRealmFiles();
const realm = new Realm({
  path: 'byt.realm',
  schema:[schedule, bible_kjv, bible_japan, bible_cht, bible_chs],
  schemaVersion: 13,
  // migration: (oldRealm, newRealm) => {
  //     var nextID1 = 0;
  //     var nextID2 = 0;
  //     var nextID3 = 0;
  //     var nextID4 = 0;
  //     // only apply this change if upgrading to schemaVersion 1
  //     const oldObjects1 = oldRealm.objects('bible_chs');
  //     const newObjects1 = newRealm.objects('bible_chs');
  //     const oldObjects2 = oldRealm.objects('bible_cht');
  //     const newObjects2 = newRealm.objects('bible_cht');
  //     const oldObjects3 = oldRealm.objects('bible_kjv');
  //     const newObjects3 = newRealm.objects('bible_kjv');
  //     const oldObjects4 = oldRealm.objects('bible_japan');
  //     const newObjects4 = newRealm.objects('bible_japan');
  //     // loop through all objects and set the name property in the new schema
  //     for (let i = 0; i < oldObjects1.length; i++) {
  //       newObjects1[i].id = nextID1;
  //       nextID1 += 1
  //     }
  //     for (let i = 0; i < oldObjects2.length; i++) {
  //       newObjects2[i].id = nextID2;
  //       nextID2 += 1
  //     }
  //     for (let i = 0; i < oldObjects3.length; i++) {
  //       newObjects3[i].id = nextID3;
  //       nextID3 += 1
  //     }
  //     for (let i = 0; i < oldObjects4.length; i++) {
  //       newObjects4[i].id = nextID4;
  //       nextID4 += 1
  //     }
  // }
});
const realm_schedule = realm.objects('schedule');
const realm_bible_kjv = realm.objects('bible_kjv');
const realm_bible_japan = realm.objects('bible_japan');
const realm_bible_cht = realm.objects('bible_cht');
const realm_bible_chs = realm.objects('bible_chs');
// SQLite.enablePromise(true);
global.db = {
  realm,
  realm_schedule,
  realm_bible_kjv,
  realm_bible_japan,
  realm_bible_cht,
  realm_bible_chs,
};
class MyHomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // this.props.navigation.navigate('Diary');
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
      if(Platform.OS ==='ios'){
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
  componentWillUnmount() {
    // stop listening for events
    this.notificationListener.remove();
  }
  render() {
    return (
      <View style={{opacity:0}}>
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