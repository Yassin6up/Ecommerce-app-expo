import { Stack as NBStack, View } from "native-base";
import React, { useState, useEffect } from "react";
import { Text } from "native-base";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { User, Home, Discover, ShoppingBag } from "iconsax-react-native";
import PageOne from "./Pages/PageOne";
import PageThree from "./Pages/PageThree";
import Header2 from "./Header2";
import UserDetail from "./User/UserDetail";
import Parts from "./Parts/Parts";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useTranslation } from "react-i18next";
import { I18nManager, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import NotificationScreen from "./Pages/NotificationScreen";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductDetails2 from "./Parts/ProductDetails2";


interface Screen {
  name: string;
  component: React.FC<any>;
  options?: BottomTabNavigationOptions;
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Pages: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const [focusedTab, setFocusedTab] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);

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
        header: () => <Header2 />,
        tabBarLabel: ({ focused }) => (
          <Text
            color={focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize="10px"
            marginBottom={5} 
          >
            {t("Home")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: ({ focused }) => (
          <Home
            width="22"
            height="22"
            color={focused ? focusedColor : unfocusedColor}
            variant={focused ? "Bold" : "Broken"}
          />
        ),
      },
    },
    {
      name: "page two",
      component: Parts,
      options: {
        headerShown: true,
        header: () => <Header2 />,
        tabBarLabel: ({ focused }) => (
          <Text
            color={focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize="10px"
            marginBottom={5}
          >
            {t("Explore")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: ({ focused }) => (
          <Discover
            width="22"
            height="22"
            color={focused ? focusedColor : unfocusedColor}
            variant={focused ? "Bold" : "Broken"}
          />
        ),
      },
    },
    {
      name: "page three",
      component: PageThree,
      options: {
        headerShown: true,
        header: () => <Header2 />,
        tabBarLabel: ({ focused }) => (
          <Text
            color={focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize="10px"
            marginBottom={5}
          >
            {t("Carte")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: ({ focused }) => (
       
<NBStack
    position="relative"
    width="24px" // Match icon width
    height="24px" // Match icon height
    overflow="visible" // Prevent clipping
  >
    {cartItems.length > 0 && (
      <NBStack
        w={4}
        h={4}
        position="absolute"
        rounded="full"
        backgroundColor="#EB2525"
        right={isArabic ? undefined : -8}
        left={isArabic ? -8 : undefined}
        top={-6}
        zIndex={87}
        justifyContent="center"
        alignItems="center"
      >
        <Text color="#FFFFFF" fontSize="8px" fontWeight="bold">
          {cartItems.length}
        </Text>
      </NBStack>
    )}
    <ShoppingBag
      width="24"
      height="24"
      color={focused ? focusedColor : unfocusedColor}
      variant={focused ? "Bold" : "Broken"}
    />
  </NBStack>
       
        ),
      },
    },
    {
      name: "page Four",
      component: UserDetail,
      options: {
        headerShown: true,
        header: () => <Header2 />,
        tabBarLabel: ({ focused }) => (
          <Text
            color={focused ? focusedColor : unfocusedColor}
            fontWeight={500}
            fontSize="10px"
            marginBottom={5}
          >
            {t("myProfil")}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: ({ focused }) => (
          <User
            width="22"
            height="22"
            color={focused ? focusedColor : unfocusedColor}
            variant={focused ? "Bold" : "Broken"}
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
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
        component={() => (
          <Tab.Navigator
            initialRouteName="page one"
            screenOptions={{
              tabBarStyle: {
                height: 80,
                backgroundColor: tabBarBgColor,
                borderTopWidth: 0,
                paddingBottom: 10,
                paddingTop: 5,
              },
            }}
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
        )}
      />
      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default Pages;