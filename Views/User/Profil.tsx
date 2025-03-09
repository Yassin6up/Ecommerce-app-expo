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
  Select, // Added for dropdown
} from "native-base";
import { ArrowLeft, Location } from "iconsax-react-native"; // Added Location icon
import * as ImagePicker from "expo-image-picker";
import i18next from "i18next";

interface UserData {
  name: string;
  address: string;
  profile_image?: string | null;
}

const Profil = () => {
  const isRTL = i18next.language === "ar";
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const toast = useToast();

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("sessionToken");
        if (!token) {
          throw new Error("No session token found");
        }
        setSessionToken(token);

        const response = await axios.get<UserData>(
          "https://backend.j-byu.shop/api/users",
          {
            params: { token: token },
          }
        );

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

  const saveChanges = async () => {
    if (!sessionToken) {
      toast.show({
        title: t("error_no_token"),
        status: "error",
      });
      return;
    }

    try {
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

      dispatch(
        updateProfile({
          name,
          address,
          profileImage,
        })
      );

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
          color={ "#F7CF9D"}
          textAlign={isRTL ? "right" : "left"}>
          {t("edit_profile")}
        </Text>
        <Box w={6} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>

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

        {/* Address Dropdown Section */}
        <VStack space={3} mb={4}>
          <Text
            color={isDarkMode ? "#E0E0E0" : "#000"}
            bold
            textAlign={isRTL ? "right" : "left"}>
            {t("address")}
          </Text>
          <Box
            flexDirection={isRTL ? "row-reverse" : "row"}
            alignItems="center"
            px={4}
            borderWidth={1}
            borderColor={isDarkMode ? "#333" : "#F5F5F5"}
            rounded="8px"
            bgColor={isDarkMode ? "#333" : "#F5F5F5"}>
            <Select
              flex={1}
              variant="unstyled"
              selectedValue={address}
              placeholder={isRTL ? "اختر العنوان" : "Select Address"}
              onValueChange={(itemValue) => setAddress(itemValue)}
              _selectedItem={{
                bg: "#F7CF9D",
              }}
              textAlign={isRTL ? "right" : "left"}
              color={isDarkMode ? "#F7CF9D" : "#000"}>
              <Select.Item label={isRTL ? "عمان" : "Amman"} value="Amman" />
              <Select.Item label={isRTL ? "إربد" : "Irbid"} value="Irbid" />
              <Select.Item label={isRTL ? "البلقاء" : "Balqa"} value="Balqa" />
              <Select.Item label={isRTL ? "الكرك" : "Karak"} value="Karak" />
              <Select.Item label={isRTL ? "معان" : "Ma'an"} value="Ma'an" />
              <Select.Item label={isRTL ? "الزرقاء" : "Zarqa"} value="Zarqa" />
              <Select.Item label={isRTL ? "المفرق" : "Mafraq"} value="Mafraq" />
              <Select.Item label={isRTL ? "الطفيلة" : "Tafilah"} value="Tafilah" />
              <Select.Item label={isRTL ? "مادبا" : "Madaba"} value="Madaba" />
              <Select.Item label={isRTL ? "جرش" : "Jerash"} value="Jerash" />
              <Select.Item label={isRTL ? "عجلون" : "Ajloun"} value="Ajloun" />
              <Select.Item label={isRTL ? "العقبة" : "Aqaba"} value="Aqaba" />
            </Select>
            <Location size="24" color="#F7CF9D" />
          </Box>
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