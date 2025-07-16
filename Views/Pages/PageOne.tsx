import React from "react";
import { View, Dimensions } from "react-native";
import styles from "../Styles";
import Men from "../Components/Men";
 import NewProducts from "../Components/NewProducts";
 import Women from "../Components/Women";
 import Kids from "../Components/Kids";
import { ScrollView } from "native-base";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Adds from "../Components/Adds";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;

    token = (await Notifications.getExpoPushTokenAsync({
      projectId,
    })).data;

    console.log("📲 Expo Push Token:", token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}



const PageOne = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  React.useEffect(() => {
    const savePushToken = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return; // User not logged in
        const token = await registerForPushNotificationsAsync();
        if (!token) return;
        await axios.post('https://backend.j-byu.shop/api/save-push-token', {
          userId: Number(userId),
          pushToken: token,
        });
      } catch (error) {
        console.error('Error saving push notification token:', error);
      }
    };
    savePushToken();
  }, []);

  return (
    <ScrollView style={[
      styles.viewContainer,
      isDarkMode ? styles.darkBckground : styles.lightBckground,
    ]} flex={1}  >
      <Adds />
      <NewProducts />
      {/* <Men  /> */}
      {/* <Kids  /> */}

    </ScrollView>
  );
};

export default PageOne;
