import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, View,SafeAreaView ,I18nManager} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { NativeBaseProvider, extendTheme } from "native-base";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import store from "./store/store";
import i18n from "./Locale/i18n";
import Pages from "./Views";
import AppScreens from "./Views/AllPages";
export default function App() {
  SplashScreen.preventAutoHideAsync();
  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
  }, []);
  let [fontsLoaded] = useFonts({
    Alexandria_100Thin: require("./assets/fonts/Alexandria/static/Alexandria-Thin.ttf"),
    Alexandria_200ExtraLight: require("./assets/fonts/Alexandria/static/Alexandria-ExtraLight.ttf"),
    Alexandria_300Light: require("./assets/fonts/Alexandria/static/Alexandria-Light.ttf"),
    Alexandria_400Regular: require("./assets/fonts/Alexandria/static/Alexandria-Regular.ttf"),
    Alexandria_500Medium: require("./assets/fonts/Alexandria/static/Alexandria-Medium.ttf"),
    Alexandria_600SemiBold: require("./assets/fonts/Alexandria/static/Alexandria-SemiBold.ttf"),
    Alexandria_700Bold: require("./assets/fonts/Alexandria/static/Alexandria-Bold.ttf"),
    Alexandria_800ExtraBold: require("./assets/fonts/Alexandria/static/Alexandria-ExtraBold.ttf"),
    Alexandria_900Black: require("./assets/fonts/Alexandria/static/Alexandria-Black.ttf"),
  });

  const newFontTheme = {
    fontConfig: {
      Alexandria: {
        100: {
          normal: "Alexandria_100Thin",
        },
        200: {
          normal: "Alexandria_200ExtraLight",
        },
        300: {
          normal: "Alexandria_300Light",
        },
        400: {
          normal: "Alexandria_400Regular",
        },
        500: {
          normal: "Alexandria_500Medium",
        },
        600: {
          normal: "Alexandria_600SemiBold",
        },
        700: {
          normal: "Alexandria_700Bold",
        },
        800: {
          normal: "Alexandria_800ExtraBold",
        },
        900: {
          normal: "Alexandria_900Black",
        },
      },
    },
    fonts: {
      heading: "Alexandria",
      body: "Alexandria",
      mono: "Alexandria",
    },
  };

  const theme = extendTheme({ ...newFontTheme });
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch((error) => {
        console.warn("Error hiding splash screen:", error);
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <NativeBaseProvider theme={theme}>
          <NavigationContainer >
               <AppScreens /> 
          </NavigationContainer>
        </NativeBaseProvider>
      </I18nextProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width:'100%'
  },
});
