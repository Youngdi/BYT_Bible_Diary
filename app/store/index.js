import { types, getParent, getSnapshot, applySnapshot, flow, onSnapshot } from "mobx-state-tree";
import DeviceBrightness from 'react-native-device-brightness';

export const storeSetting = types
  .model("setting", {
    language: 'cht',
    fontFamily: 'Avenir',
    fontSize: 18,
    fontColor: '#000',
    bgColor: '#fff',
    lineHeight: 33,
    brightnessValue: 1,
    readingMode: false, // 0 -> day, 1 -> night
    tourist: false,
  })
  .actions(self => ({
    handleSettingFontSize(value) {
      if(self.fontSize >= 28 && value == 2) return null;
      if(self.fontSize <= 12 && value == -2) return null;
      self.fontSize = self.fontSize + value;
    },
    handleSettingFontFamily(fontFamily) {
      self.fontFamily = fontFamily;
    },
    handleSettingLineHeight(value) {
      self.lineHeight = value;
    },
    handleSettingReadingMode() {
      self.bgColor = !self.readingMode ? '#333' : '#fff';
      self.fontColor = !self.readingMode ? '#ccc' : '#000',
      self.readingMode = !self.readingMode;
    },
    handleSliderValueChange(value) {
      DeviceBrightness.setBrightnessLevel(value);
      self.brightnessValue = value;
    },
    handleCloseTourist(){
      self.tourist = false;
    },
    syncLocalstorage(setting){
      applySnapshot(self, setting);
    },
  })).create({});

onSnapshot(storeSetting, (setting) => {
  global.storage.save({
    key: '@setting',
    data: setting,
    expires: null,
  });
});