package com.bytbible.diary;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.microsoft.codepush.react.CodePush;
import io.realm.react.RealmReactPackage;
import com.github.alinz.reactnativewebviewbridge.WebViewBridgePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.rnfs.RNFSPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import org.capslock.RNDeviceBrightness.RNDeviceBrightness;
import com.cmcewen.blurview.BlurViewPackage;
import com.airbnb.android.react.lottie.LottiePackage;
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
    protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
    }
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new CodePush("wjDehiEoZkysspJnEoQVXo-xtA3kc5a64ba8-c46e-44a1-a546-41de22ffbd48", getApplicationContext(), BuildConfig.DEBUG, R.string.CodePushPublicKey),
            new RNDeviceBrightness(),
            new FIRMessagingPackage(),
            new WebViewBridgePackage(),
            new RNFetchBlobPackage(),
            new RealmReactPackage(),
            new VectorIconsPackage(),
            new RNSpinkitPackage(),
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
