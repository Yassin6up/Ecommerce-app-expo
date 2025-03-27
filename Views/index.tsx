import { Stack, View } from "native-base";
import React, { useState, useEffect } from "react";
import { Text } from "native-base";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { User, Home, Discover, ShoppingCart } from "iconsax-react-native";
import PageOne from "./Pages/PageOne";
import PageThree from "./Pages/PageThree";
import Header2 from "./Header2";
import UserDetail from "./User/UserDetail";
import Parts from "./Parts/Parts";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useTranslation } from "react-i18next";
import { I18nManager, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo"; // Import NetInfo

interface Screen {
  name: string;
  component: React.FC<any>;
  options?: BottomTabNavigationOptions;
}

const Tab = createBottomTabNavigator();

const Pages: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const [focusedTab, setFocusedTab] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true); // State to track online/offline status

  const handleTabPress = (name: string) => {
    setFocusedTab(name);
  };

  // Check if the current language is Arabic (RTL)
  const isArabic = i18n.language === "ar" || I18nManager.isRTL;

  // Define black-and-white color scheme
  const tabBarBgColor = isDarkMode ? "#000000" : "#FFFFFF";
  const focusedColor = isDarkMode ? "#FFFFFF" : "#000000";
  const unfocusedColor = isDarkMode ? "#CCCCCC" : "#333333";

  // Use NetInfo to monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const screens: Screen[] = [
    {
      name: "page one",
      component: PageOne,
      options: {
        headerShown: true,
        header: (props) => <Header2 />,
        tabBarStyle: {
          height: 50,
          backgroundColor: tabBarBgColor,
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize={"10px"}
          >
            {t("Home")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <Home
            width="22"
            height="22"
            color={props.focused ? focusedColor : unfocusedColor}
            variant={props.focused ? "Bold" : "Broken"}
          />
        ),
      },
    },
    {
      name: "page two",
      component: Parts,
      options: {
        headerShown: true,
        header: (props) => <Header2 />,
        tabBarStyle: {
          height: 50,
          backgroundColor: tabBarBgColor,
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize={"10px"}
          >
            {t("Explore")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <Discover
            width="22"
            height="22"
            color={props.focused ? focusedColor : unfocusedColor}
            variant={props.focused ? "Bold" : "Broken"}
          />
        ),
      },
    },
    {
      name: "page three",
      component: PageThree,
      options: {
        headerShown: true,
        header: (props) => <Header2 />,
        tabBarStyle: {
          height: 50,
          backgroundColor: tabBarBgColor,
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize={"10px"}
          >
            {t("Carte")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <Stack position={"relative"}>
            {cartItems.length > 0 && (
              <Stack
                w={3}
                h={3}
                position="absolute"
                rounded="full"
                backgroundColor="#EB2525"
                right={isArabic ? undefined : -4}
                left={isArabic ? -4 : undefined}
                top={-2}
                zIndex={87}
              />
            )}
            <ShoppingCart
              width="22"
              height="22"
              color={props.focused ? focusedColor : unfocusedColor}
              variant={props.focused ? "Bold" : "Broken"}
            />
          </Stack>
        ),
      },
    },
    {
      name: "page Four",
      component: UserDetail,
      options: {
        headerShown: true,
        header: (props) => <Header2 />,
        tabBarStyle: {
          height: 50,
          backgroundColor: tabBarBgColor,
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize={"10px"}
          >
            {t("myProfil")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <User
            width="22"
            height="22"
            color={props.focused ? focusedColor : unfocusedColor}
            variant={props.focused ? "Bold" : "Broken"}
          />
        ),
      },
    },
  ];

  // Reverse the screens array if Arabic
  const orderedScreens = isArabic ? [...screens].reverse() : screens;

  // Render offline message or tab navigator based on network status
  if (!isOnline) {
    return (
      <View style={styles.offlineContainer}>
        <Text fontSize="lg" color={isDarkMode ? "#FFFFFF" : "#000000"}>
          {t("You are offline. Please check your internet connection.")}
        </Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="page one"
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: 50,
          backgroundColor: tabBarBgColor,
          borderTopWidth: 0,
        },
        tabBarLabel: () => null,
      })}
    >
      {orderedScreens.map((screen: Screen, index: number) => (
        <Tab.Screen
          key={index}
          options={screen.options}
          name={screen.name}
          component={screen.component}
          listeners={{
            tabPress: (e) => {
              handleTabPress(screen.name);
            },
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // You can adjust this based on your theme
  },
});

export default Pages;