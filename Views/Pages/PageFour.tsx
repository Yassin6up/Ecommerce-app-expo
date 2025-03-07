import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  VStack,
  HStack,
  Button,
  Avatar,
  Switch,
  Divider,
  Spinner,
} from "native-base";
import styles from "../Styles";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import { setPassHome } from "../../store/PassHomeSlice";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define User interface
interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

const PageFour = () => {
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const navigation: any = useNavigation();

  // State for user profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = isDarkMode ? "#E0E0E0" : "#000000";
  const secondaryTextColor = isDarkMode ? "#9E9E9E" : "#616161";
  const isRTL = i18n.language === "ar";
  const textAlignStyle = isRTL ? "right" : "left";

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get session token from AsyncStorage
        const sessionToken = await AsyncStorage.getItem("sessionToken");

        if (!sessionToken) {
          throw new Error("No session token found");
        }

        // Fetch user data
        const response = await axios.get(
          "https://backend.j-byu.shop/api/users",
          {
            params: { token: sessionToken },
          }
        );

        // Set user profile
        setUserProfile({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          profileImage: response.data.profileImage,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      // Remove tokens and user data from AsyncStorage
      await AsyncStorage.removeItem("sessionToken");
      await AsyncStorage.removeItem("userId");

      // Dispatch action to update app state
      dispatch(setPassHome(false));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <VStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}>
        <Spinner color="#F7CF9D" size="lg" />
        <Text color={textColor} marginTop={4}>
          {t("Loading")}
        </Text>
      </VStack>
    );
  }

  // Error state
  if (error || !userProfile) {
    return (
      <VStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}>
        <Text color="red.500" bold>
          {t("Error_Fetching_Profile")}
        </Text>
        <Button
          onPress={() => navigation.navigate("Login")}
          marginTop={4}
          variant="outline">
          {t("Go_to_Login")}
        </Button>
      </VStack>
    );
  }

  return (
    <VStack
      space={5}
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
      paddingX={6}
      paddingY={4}>
      {/* Profile Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space={4} alignItems="center">
          <Avatar size="lg" source={require("../../assets/user.png")} />
          <VStack>
            <Text
              style={{
                color: textColor,
                fontSize: 20,
                fontWeight: "bold",
                textAlign: textAlignStyle,
              }}>
              {userProfile?.name || t("Guest User")}
            </Text>
            <Text
              style={{ color: secondaryTextColor, textAlign: textAlignStyle }}>
              {userProfile?.address || "لا وجود للعنوان"}
            </Text>
            <Text style={{ color: textColor, textAlign: textAlignStyle }}>
              {userProfile?.phone || t("No_Phone_Number")}
            </Text>
          </VStack>
        </HStack>
        <Button variant="ghost" onPress={() => navigation.navigate("profil")}>
          <Text style={{ color: textColor }}>{t("Edit")}</Text>
        </Button>
      </HStack>

      <Divider bgColor="#F7CF9D" />

      {/* Policy Section */}
      <VStack space={3}>
        <Text
          bold
          fontSize="xl"
          style={{ color: textColor, textAlign: textAlignStyle }}>
          {t("Policy")}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("Privacy Policy")}
          </Text>
          <Button variant="ghost" onPress={() => navigation.navigate("Policy")}>
            <Text style={{ color: "#F7CF9D" }}>{t("View")}</Text>
          </Button>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("Terms and Conditions")}
          </Text>
          <Button
            variant="ghost"
            onPress={() => navigation.navigate("TermsAndCondition")}>
            <Text style={{ color: "#F7CF9D" }}>{t("View")}</Text>
          </Button>
        </HStack>
      </VStack>

      {/* Order Tracking Section */}
      <VStack space={3}>
        <Text
          bold
          fontSize="xl"
          style={{ color: textColor, textAlign: textAlignStyle }}>
          {t("Order Tracking")}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("my_orders")}
          </Text>
          <Button variant="ghost" onPress={() => navigation.navigate("Orders")}>
            <Text style={{ color: "#F7CF9D" }}>{t("View")}</Text>
          </Button>
        </HStack>
      </VStack>

      {/* Logout Button */}
      <Button
        variant="solid"
        bgColor="#F7CF9D"
        onPress={handleLogout}
        _text={{ color: "white", fontWeight: "bold" }}>
        {t("Logout")}
      </Button>
    </VStack>
  );
};

export default PageFour;
