package com.bytbiblediary;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.airbnb.android.react.lottie.LottiePackage;
import io.realm.react.RealmReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.robinpowered.react.ScreenBrightness.ScreenBrightnessPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.rnfs.RNFSPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new LottiePackage(),
            new RealmReactPackage(),
            new VectorIconsPackage(),
            new RNSpinkitPackage(),
            new ScreenBrightnessPackage(),
            new RNI18nPackage(),
            new RNFSPackage(),
            new BlurViewPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
