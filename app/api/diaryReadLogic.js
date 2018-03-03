import moment from 'moment/min/moment-with-locales';
import * as R from 'ramda';

export async function handleScroll(event) {
  this.closeActionButton();
  const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
  if(this.state.isTooltipModalVisible) return;
  const paddingToBottom = 20;
  const currentOffset = event.nativeEvent.contentOffset.y;
  const direction = currentOffset > this.offset ? 'down' : 'up';
  const distance = this.offset ? (this.offset - currentOffset) : 0;
  const footerNewPosition = this.state.footerScrollY._value - distance;
  if (currentOffset > 0 && currentOffset < (this.contentHeight - this.scrollViewHeight)) {
    if (direction === 'down') { //往下滑
      this.setState({
        fullScreenMode: true,
      });
      this.state.arrowFadeInOpacity.setValue(1);
      if (this.state.footerScrollY._value < 50) {
        this.state.footerScrollY.setValue(footerNewPosition > 50 ? 50 : footerNewPosition);
        this.state.headerScrollY.setValue(footerNewPosition > 30 ? -100 : -footerNewPosition);
      }
      if (this.state.footerScrollY._value < 200) {
        this.state.fadeInOpacity.setValue(footerNewPosition > 50 ? 0 : 1 - footerNewPosition / 100);
      }
    }
    if (direction === 'up') { //往上滑
      this.setState({
        fullScreenMode: footerNewPosition == 50 ? true : false,
      });
      this.state.arrowFadeInOpacity.setValue(footerNewPosition == 50 ? 1 : 0);
      if (this.state.footerScrollY._value >= 0) {
        this.state.footerScrollY.setValue(footerNewPosition < 0 ? 0 : footerNewPosition);
        this.state.headerScrollY.setValue(footerNewPosition < 0 ? 0 : footerNewPosition > 30 ? -150 : -footerNewPosition);
        this.state.fadeInOpacity.setValue(footerNewPosition < 0 ? 1 : footerNewPosition == 50 ? 0 : 1 - footerNewPosition / 100);
      }
    }
    this.offset = currentOffset;
  }
  if(layoutMeasurement.height + contentOffset.y >= contentSize.height + 120) {
    if(this.state.hasRead) return;
    if(this.state.markedDates[this.state.currentDate].marked) return;
    if(this.state.content.length == 0) return;
    const markedDates = {
      ...this.state.markedDates,
      [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], marked: true}
    }
    const recordMarkedDates ={
      ...this.state.markedDates,
      [this.state.currentDate] : {...this.state.markedDates[this.state.currentDate], marked: true, selected: false}
    }
    this.setState({
      finishedReading: true,
      markedDates: markedDates,
    });
    await global.storage.save({key: '@readingSchdule', data: recordMarkedDates, expires: null});
  }
}
