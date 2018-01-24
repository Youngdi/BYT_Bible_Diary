import React, { Component } from 'react';
import { Button, ScrollView, Text, View, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView, StackNavigator, TabNavigator } from 'react-navigation';
import DiaryScreen from './DiaryRead';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n, { getLanguages } from 'react-native-i18n';
import RNFS from 'react-native-fs';
import Realm from 'realm';
import LottieView from 'lottie-react-native';
const Person = {
  name: 'Person',
  properties: {
    name: 'string',
    nickname: 'string',
    birthday: 'date',
    picture: 'string?'
  }
}

const bible_chs = {
  name: 'bible_chs',
  properties: {
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?'
  }
}

const bible_cht = {
  name: 'bible_cht',
  properties: {
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?'
  }
}

const bible_japan = {
  name: 'bible_japan',
  properties: {
    id: 'int?',
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?'
  }
}

const bible_kjv = {
  name: 'bible_kjv',
  properties: {
    version: 'string?',
    testament: 'int?',
    book_ref: 'string?',
    book_name: 'string?',
    book_name_short: 'string?',
    book_nr: 'int?',
    chapter_nr: 'int?',
    verse_nr: 'int?',
    verse: 'string?'
  }
}

const schedule = {
  name: 'schedule',
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
  schema:[schedule, bible_kjv,bible_japan, bible_cht, bible_chs, Person],
});

const realm_schedule = realm.objects('schedule');
const realm_bible_kjv = realm.objects('bible_kjv');
const realm_bible_japan = realm.objects('bible_japan');
const realm_bible_cht = realm.objects('bible_cht');
const realm_bible_chs = realm.objects('bible_chs');
// SQLite.enablePromise(true);
class MyHomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: new Animated.Value(0),
    };
  }
  componentDidMount() {
    this.animation.play();
  }
  componentWillMount = async () => {
    this.db = {
     realm_schedule,
     realm_bible_kjv,
     realm_bible_japan,
     realm_bible_cht,
     realm_bible_chs,
    }
  }
  render() {
    return (
      <View>
        <Button title="讀經去" onPress={() => this.props.navigation.navigate('Diary', { db: this.db})}/>
        <LottieView
              style={{width:100, height:60}}
              ref={animation => {
                this.animation = animation;
              }}
              source={require('../lottie/Brightness.json')}
            />
      </View>
    );
  }
}
class MyNavScreen extends Component {
  render() {
    return (
      <ScrollView>
        <View>
          <View style={{display:'flex', flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
            <Text>1/16{'  '}</Text>
            <TouchableOpacity onPress={() => { alert('hi!') }}>
              <Text>ps9{'  '}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { alert('hi!') }}>
              <Text>ps9{'  '}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { alert('hi!') }}>
              <Text>ps9{'  '}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { alert('hi!') }}>
              <Text>ps9{'  '}</Text>
            </TouchableOpacity>
          </View>
          <View
          // onLayout={(e)=> console.log(e.nativeEvent.layout)}
          >
            <Text>Psalms9章15-20節{'\n'}
              <Text>1 <Text>外邦人</Text></Text>
              <Text>2 <Text>耶穌</Text></Text>
              {'\n'}
            </Text>
          </View>
          <View
          // onLayout={(e)=> console.log(e.nativeEvent.layout)}
          >
            <Text>Psalms9章15-20節{'\n'}</Text>
            <Text>
              <Text>1 <Text>外邦人</Text></Text>
              <Text>2 <Text>耶穌</Text></Text>
            </Text>
          </View>
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