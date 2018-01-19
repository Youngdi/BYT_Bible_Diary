import React, { Component } from 'react';
import { Button, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView, StackNavigator, TabNavigator } from 'react-navigation';
import DiaryScreen from './DiaryRead';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SQLite from 'react-native-sqlite-storage';
import I18n, { getLanguages } from 'react-native-i18n';
// SQLite.DEBUG(true);
SQLite.enablePromise(true);
class MyHomeScreen extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount = async () => {
    const bibleDB = await SQLite.openDatabase({name : "Bible.db", createFromLocation : "1"});
    this.db = {
      bibleDB,
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