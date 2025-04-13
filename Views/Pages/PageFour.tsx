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
  Pressable,
} from "native-base";
import { BackHandler } from "react-native";
import styles from "../Styles";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import { setPassHome } from "../../store/PassHomeSlice";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  deleted_at?: string | null; // Add deleted_at to track soft-delete status
}

const PageFour = () => {
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const navigation: any = useNavigation();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccountDeleted, setIsAccountDeleted] = useState<boolean>(false);

  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const dividerColor = isDarkMode ? "#FFFFFF" : "#000000";

  const isRTL = i18n.language === "ar";
  const textAlignStyle = isRTL ? "right" : "left";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const sessionToken = await AsyncStorage.getItem("sessionToken");
        const userId = await AsyncStorage.getItem("userId");

        if (!sessionToken || !userId) {
          throw new Error("No session token or user ID found");
        }

        // Fetch user profile with session token
        const response = await axios.get("https://backend.j-byu.shop/api/users", {
          params: { token: sessionToken },
        });

        const profile: UserProfile = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          profileImage: response.data.profileImage,
          deleted_at: response.data.deleted_at, // Backend should return deleted_at
        };

        setUserProfile(profile);
        setIsAccountDeleted(!!profile.deleted_at); // Set based on deleted_at
        await AsyncStorage.setItem(
          "isAccountDeleted",
          profile.deleted_at ? "true" : "false"
        );

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.navigate("page one");
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("sessionToken");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("isAccountDeleted");
      dispatch(setPassHome(false));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem("sessionToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!userId || !sessionToken) {
        throw new Error("No user ID or session token found");
      }

      // Call soft-delete API with authentication
      await axios.delete(
        `https://backend.j-byu.shop/api/user/${userId}/soft-delete`,
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }
      );

      // Update local state
      setIsAccountDeleted(true);
      await AsyncStorage.setItem("isAccountDeleted", "true");

      // Update user profile to reflect deleted_at
      setUserProfile((prev) =>
        prev ? { ...prev, deleted_at: new Date().toISOString() } : prev
      );
    } catch (error: any) {
      console.error("Error soft-deleting account:", error);
      setError(error.response?.data?.message || "Failed to delete account");
    }
  };

  const handleRestoreAccount = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem("sessionToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!userId || !sessionToken) {
        throw new Error("No user ID or session token found");
      }

      // Call restore API with authentication
      await axios.post(
        `https://backend.j-byu.shop/api/user/${userId}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }
      );

      // Update local state
      setIsAccountDeleted(false);
      await AsyncStorage.setItem("isAccountDeleted", "false");

      // Update user profile to clear deleted_at
      setUserProfile((prev) => (prev ? { ...prev, deleted_at: null } : prev));
    } catch (error: any) {
      console.error("Error restoring account:", error);
      setError(error.response?.data?.message || "Failed to restore account");
    }
  };

  if (isLoading) {
    return (
      <VStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
      >
        <Spinner color={buttonBgColor} size="lg" />
        <Text color={textColor} marginTop={4}>
          {t("Loading")}
        </Text>
      </VStack>
    );
  }

  if (error || !userProfile) {
    return (
      <VStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
      >
        <Text color="red.500" bold>
          { t("error_fetch_profile")}
        </Text>
        <Pressable
          onPress={handleLogout}
          marginTop={4}
          variant="outline"
          borderColor={"red.500"}
          backgroundColor={"red.100"}
          padding={4}
          rounded={8}
        >
          <Text color={"red.500"}>{t("login")}</Text>
        </Pressable>
      </VStack>
    );
  }

  return (
    <VStack
      space={5}
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
      paddingX={6}
      paddingY={4}
    >
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
              }}
            >
              {userProfile?.name || t("Guest User")}
            </Text>
            <Text style={{ color: secondaryTextColor }}>
              {userProfile?.address || "لا وجود للعنوان"}
            </Text>
            <Text style={{ color: textColor, textAlign: textAlignStyle }}>
              {userProfile?.phone || t("No_Phone_Number")}
            </Text>
          </VStack>
        </HStack>
        <Button variant="ghost" onPress={() => navigation.navigate("profil")}>
          <Text style={{ color: buttonBgColor }}>{t("Edit")}</Text>
        </Button>
      </HStack>

      <Divider bgColor={dividerColor} />

      {/* Policy Section */}
      <VStack space={3}>
        <Text
          bold
          fontSize="xl"
          style={{ color: textColor, textAlign: textAlignStyle }}
        >
          {t("Policy")}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("Privacy Policy")}
          </Text>
          <Button variant="ghost" onPress={() => navigation.navigate("Policy")}>
            <Text style={{ color: buttonBgColor }}>{t("View")}</Text>
          </Button>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("Terms and Conditions")}
          </Text>
          <Button
            variant="ghost"
            onPress={() => navigation.navigate("TermsAndCondition")}
          >
            <Text style={{ color: buttonBgColor }}>{t("View")}</Text>
          </Button>
        </HStack>
      </VStack>

      {/* Order Tracking Section */}
      <VStack space={3}>
        <Text
          bold
          fontSize="xl"
          style={{ color: textColor, textAlign: textAlignStyle }}
        >
          {t("Order Tracking")}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("my_orders")}
          </Text>
          <Button variant="ghost" onPress={() => navigation.navigate("Orders")}>
            <Text style={{ color: buttonBgColor }}>{t("View")}</Text>
          </Button>
        </HStack>
      </VStack>

      {/* Favorites Section */}
      <VStack space={3}>
        <Text
          bold
          fontSize="xl"
          style={{ color: textColor, textAlign: textAlignStyle }}
        >
          {t("Favorites")}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <Text style={{ color: textColor, textAlign: textAlignStyle }}>
            {t("my_favorites")}
          </Text>
          <Button
            variant="ghost"
            onPress={() => navigation.navigate("MyFavourite")}
          >
            <Text style={{ color: buttonBgColor }}>{t("View")}</Text>
          </Button>
        </HStack>
      </VStack>

      {/* Logout Button */}
      <Button
        variant="solid"
        bg={buttonBgColor}
        onPress={handleLogout}
        _text={{ color: buttonTextColor, fontWeight: "bold" }}
      >
        {t("Logout")}
      </Button>

      {/* Delete/Restore Account Button */}
      <Button
        variant="solid"
        bg={isAccountDeleted ? "green.500" : "red.500"}
        onPress={isAccountDeleted ? handleRestoreAccount : handleDeleteAccount}
        _text={{ color: buttonTextColor, fontWeight: "bold" }}
      >
        {t(isAccountDeleted ? "repback_account" : "delete_account")}
      </Button>
    </VStack>
  );
};

export default PageFour;