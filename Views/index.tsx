import { Stack, View } from "native-base";
import React, { useState } from "react";
import { Text } from "native-base";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { User,Home ,Discover,ShoppingCart} from "iconsax-react-native";
import PageOne from "./Pages/PageOne";

import PageThree from "./Pages/PageThree";

import Header from "./Header";
import styles from "./Styles";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useTranslation } from "react-i18next";
import Parts from "./Parts/Parts";
import Header2 from "./Header2";
import UserDetail from "./User/UserDetail";
interface Screen {
  name: string;
  component: React.FC<any>;
  options?: BottomTabNavigationOptions;
}
const Tab = createBottomTabNavigator();

const Pages: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t } = useTranslation(); 
  const [focusedTab, setFocusedTab] = useState<string>("");

  const handleTabPress = (name: string) => {
    setFocusedTab(name);
  };
  const screens: Screen[] = [
    {
      name: "page one",
      component: PageOne,
      options: {
        headerShown: true,
        header: (props) => <Header2/>,
        tabBarStyle: {
          height: 50,
          backgroundColor: isDarkMode ? "black" : "white",
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            fontWeight={500}
            fontSize={"10px"}
          >
          {t('Home')}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <Home
            width="22"
            height="22"
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            variant={isDarkMode?"Broken":"Bold"}
          />
        ),
      },
    },
    {
      name: "page two",
      component: Parts,
      options: {
        headerShown: true,
        header: (props) => <Header2/>,
        tabBarStyle: {
          height: 50,
          backgroundColor: isDarkMode ? "black" : "white",
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            fontWeight={500}
            fontSize={"10px"}
          >
            {t('Explore')}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
         
          <Discover
            width="22"
            height="22"
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            variant={isDarkMode?"Broken":"Bold"}
          />
        ),
      },
    },
    {
      name: "page three",
      component: PageThree,
      options: {
        headerShown: true,
        header: (props) => <Header2/>,
        tabBarStyle: {
          height: 50,
          backgroundColor: isDarkMode ? "black" : "white",
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            fontWeight={500}
            fontSize={"10px"}
          >
           {t('Carte')}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <Stack position={'relative'}>
           {cartItems.length > 0 && (
              <Stack
                w={3}
                h={3}
                position="absolute"
                rounded="full"
                backgroundColor="#FFCC8B"
                right={-4}
                top={-2}
                zIndex={87}
              />
            )}
             <ShoppingCart
            width="22"
            height="22"
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            variant={isDarkMode?"Broken":"Bold"}
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
        header: (props) => <Header2/>,
        tabBarStyle: {
          height: 50,
          backgroundColor: isDarkMode ? "black" : "white",
          borderTopWidth: 0,
        },
        tabBarLabel: (props) => (
          <Text
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            fontWeight={500}
            fontSize={"10px"}
          >
           {t('myProfil')}
          </Text>
        ),
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarIcon: (props) => (
          <User
            width="22"
            height="22"
            color={props.focused ? "#F7CF9D" : "#D1D1D1"}
            variant={isDarkMode?"Broken":"Bold"}
          />
        ),
      },
    },
  ];
  return (

      <Tab.Navigator
        initialRouteName="page one"
        screenOptions={({ route }) => ({
          tabBarStyle: {
            height: 50,
            backgroundColor: isDarkMode ? "black" : "white",
            borderTopWidth: 0,
          },
          tabBarLabel: () => null,
        })}
      >
        {screens.map((screen: Screen, index: number) => (
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

export default Pages;
