import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import Triangle from 'react-native-triangle';
import { Calendar } from 'react-native-calendars';

const {
  height: deviceHeight,
  width: deviceWidth,
} = Dimensions.get('window');

export default class CalendarModal extends Component {
  render() {
    return (
      <Modal 
        isVisible={this.props.isCalendarModalVisible}
        onBackdropPress={() => this.props.toggleModalCalendar()}
        backdropOpacity={0}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        style={{ position: 'absolute', right:0, width: deviceWidth * 0.8, top: 68}}
      >
      <View>
        <Triangle 
          style={{position:'absolute', top:-10, right:10}}
          width={20}
          height={10}
          color={'#111'}
          direction={'up'}
        />
        <Calendar
          current={this.props.currentDate}
          onDayPress={(day) => this.props.handleChangeDay(day)}
          monthFormat={'yyyy MM'}
          hideDayNames={true}
          hideExtraDays={true}
          onMonthChange={(month) => this.props.handleMonthChange(month)}
          disableMonthChange={false}
          firstDay={1}
          markedDates={this.props.markedDates}
          style={{opacity: 0.98}}
          theme={{
            backgroundColor: '#111',
            calendarBackground: '#111',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#EE2B47',
            selectedDayTextColor: '#b6c1cd',
            selectedDotColor: '#FCCF4D',
            dayTextColor: '#fff',
            dotColor: '#FCCF4D',
            arrowColor: 'white',
            monthTextColor: 'white',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
        />
      </View>
      </Modal>
    );
  }
}