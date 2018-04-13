import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import Triangle from 'react-native-triangle';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { storeSetting } from '../store/index';
import { observer } from "mobx-react";

const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

LocaleConfig.locales['en'] = {
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
};
LocaleConfig.locales['cht'] = {
  dayNamesShort: ['日','一','二','三','四','五','六']
};
LocaleConfig.locales['chs'] = {
  dayNamesShort: ['日','一','二','三','四','五','六']
};
LocaleConfig.locales['ja'] = {
  dayNamesShort: ['にち','げつ','か','すい','もく','きん','ど']
};

@observer
export default class CalendarModal extends Component {
  render() {
    LocaleConfig.defaultLocale = storeSetting.language;
    return (
      <Modal 
        isVisible={this.props.isCalendarModalVisible}
        onBackdropPress={() => this.props.toggleModalCalendar()}
        backdropOpacity={0}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        animationOutTiming={10}
        style={{ position: 'absolute', right:0, width: deviceWidth * 0.8, top: 68}}
      >
      <View>
        <Triangle 
          style={{position:'absolute', top:-10, right:10}}
          width={20}
          height={10}
          color={'#1E1E1E'}
          direction={'up'}
        />
        <Calendar
          current={this.props.currentDate}
          onDayPress={(day) => this.props.handleChangeDay(day)}
          monthFormat={'yyyy MM'}
          // hideDayNames={true}
          hideExtraDays={true}
          onMonthChange={(month) => this.props.handleMonthChange(month)}
          disableMonthChange={false}
          firstDay={1}
          markedDates={this.props.markedDates}
          style={{opacity: 0.98}}
          theme={{
            backgroundColor: '#1E1E1E',
            calendarBackground: '#1E1E1E',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#CF0A2C',
            selectedDayTextColor: '#b6c1cd',
            selectedDotColor: '#FCCF4D',
            dayTextColor: '#fff',
            dotColor: '#FCCF4D',
            arrowColor: 'white',
            monthTextColor: 'white',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
        />
      </View>
      </Modal>
    );
  }
}