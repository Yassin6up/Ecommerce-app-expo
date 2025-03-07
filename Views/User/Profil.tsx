import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../store/store";
import styles from "../Styles";
import { useTranslation } from "react-i18next";
import { updateProfile } from "../../store/userSlice";
import {
  Pressable,
  ScrollView,
  Stack,
  Text,
  Box,
  Image,
  Button,
  VStack,
  HStack,
  Input,
  Divider,
  useToast,
} from "native-base";
import { ArrowLeft } from "iconsax-react-native";
import * as ImagePicker from "expo-image-picker";
import i18next from "i18next";

interface UserData {
  name: string;
  address: string;
  profile_image?: string | null;
}

const Profil = () => {
  // Internationalization and Navigation
  const isRTL = i18next.language === "ar";
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const toast = useToast();

  // Redux Hooks
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  // State Management
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch User Profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Retrieve session token
        const token = await AsyncStorage.getItem("sessionToken");

        if (!token) {
          throw new Error("No session token found");
        }

        setSessionToken(token);

        // Fetch user data
        const response = await axios.get<UserData>(
          "https://backend.j-byu.shop/api/users",
          {
            params: { token: token },
          }
        );

        // Update state with user data
        setName(response.data.name || "");
        setAddress(response.data.address || "");
        setProfileImage(response.data.profile_image || null);
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.show({
          title: t("error_fetch_profile"),
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Image Picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      toast.show({
        title: t("error_pick_image"),
        status: "error",
      });
    }
  };

  // Save Profile Changes
  const saveChanges = async () => {
    if (!sessionToken) {
      toast.show({
        title: t("error_no_token"),
        status: "error",
      });
      return;
    }

    try {
      // Update profile
      await axios.put(
        "https://backend.j-byu.shop/api/user/address-name",
        {
          name: name,
          address: address,
        },
        {
          params: { token: sessionToken },
        }
      );

      // Dispatch local state update
      dispatch(
        updateProfile({
          name,
          address,
          profileImage,
        })
      );

      // Show success toast
      toast.show({
        title: t("save_changes_success"),
        status: "success",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast.show({
        title: t("save_changes_error"),
        status: "error",
      });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <Stack
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}
        paddingX={4}
        paddingY={6}>
        <Text>{t("loading")}</Text>
      </Stack>
    );
  }

  return (
    <Stack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
      paddingX={4}
      paddingY={6}>
      {/* Page Header */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={isRTL ? "row-reverse" : "row"}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft
            size={24}
            color={isDarkMode ? "#F7CF9D" : "#F9D77E"}
            style={{ transform: isRTL ? [{ rotateY: "180deg" }] : undefined }}
          />
        </Pressable>
        <Text
          bold
          fontSize="xl"
          color={isDarkMode ? "#F7CF9D" : "#F9D77E"}
          textAlign={isRTL ? "right" : "left"}>
          {t("edit_profile")}
        </Text>
        <Box w={6} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Image Section
        <VStack alignItems="center" space={4} mb={6}>
          <Pressable onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                alt="Profile Image"
                size={24}
                borderRadius={12}
              />
            ) : (
              <Box
                size={24}
                bgColor={isDarkMode ? "#333" : "#DDD"}
                borderRadius={12}
                alignItems="center"
                justifyContent="center"
              >
                <Text color={isDarkMode ? "#F7CF9D" : "#F9D77E"}>
                  {t("change_image")}
                </Text>
              </Box>
            )}
          </Pressable>
        </VStack> */}

        {/* Name Input Section */}
        <VStack space={3} mb={4}>
          <Text
            color={isDarkMode ? "#E0E0E0" : "#000"}
            bold
            textAlign={isRTL ? "right" : "left"}>
            {t("name")}
          </Text>
          <Input
            variant="filled"
            bgColor={isDarkMode ? "#333" : "#F5F5F5"}
            color={isDarkMode ? "#F7CF9D" : "#000"}
            value={name}
            onChangeText={setName}
            placeholder={t("edit_name")}
            textAlign={isRTL ? "right" : "left"}
            _focus={{ borderColor: "#F7CF9D" }}
          />
        </VStack>

        {/* Address Input Section */}
        <VStack space={3} mb={4}>
          <Text
            color={isDarkMode ? "#E0E0E0" : "#000"}
            bold
            textAlign={isRTL ? "right" : "left"}>
            {t("address")}
          </Text>
          <Input
            variant="filled"
            bgColor={isDarkMode ? "#333" : "#F5F5F5"}
            color={isDarkMode ? "#F7CF9D" : "#000"}
            value={address}
            onChangeText={setAddress}
            placeholder={t("Enter your address")}
            textAlign={isRTL ? "right" : "left"}
            _focus={{ borderColor: "#F7CF9D" }}
          />
        </VStack>

        <Divider bgColor="#F7CF9D" />

        {/* Save Button */}
        <Button
          mt={6}
          bgColor="#F7CF9D"
          onPress={saveChanges}
          _text={{ color: "white", fontWeight: "bold" }}>
          {t("save_changes")}
        </Button>
      </ScrollView>
    </Stack>
  );
};

export default Profil;
