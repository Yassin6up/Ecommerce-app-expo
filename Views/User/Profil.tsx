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
  Button,
  VStack,
  HStack,
  Input,
  Divider,
  useToast,
  Select,
} from "native-base";
import { ArrowLeft, Location } from "iconsax-react-native";
import * as ImagePicker from "expo-image-picker";
import i18next from "i18next";
import { BackHandler } from "react-native"; 
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
  useEffect(() => {
    const backAction = () => {
      navigation.navigate("UserPage"); 
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, [navigation]);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  const [name, setName] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [addressDetails, setAddressDetails] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fullAddress = selectedCity && addressDetails 
    ? `${selectedCity}, ${addressDetails}` 
    : selectedCity || addressDetails || "";

  // Define black-and-white color scheme
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000"; // Titles, bold text
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333"; // Input values, placeholders
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const dividerColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBgColor = isDarkMode ? "#1A1A1A" : "#F5F5F5"; // Slightly off for contrast
  const borderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

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
        const [city, ...details] = (response.data.address || "").split(", ");
        setSelectedCity(city || "");
        setAddressDetails(details.join(", ") || "");
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
  }, [t]);

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
          address: fullAddress,
        },
        {
          params: { token: sessionToken },
        }
      );

      dispatch(
        updateProfile({
          name,
          address: fullAddress,
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
        style={[styles.mainContainer, { backgroundColor }]}
        paddingX={4}
        paddingY={6}
      >
        <Text color={primaryTextColor}>{t("loading")}</Text>
      </Stack>
    );
  }

  return (
    <Stack
      style={[styles.mainContainer, { backgroundColor }]}
      paddingX={4}
      paddingY={6}
    >
      <HStack
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={isRTL ? "row-reverse" : "row"}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft
            size={24}
            color={iconColor}
            style={{ transform: isRTL ? [{ rotateY: "180deg" }] : undefined }}
          />
        </Pressable>
        <Text
          bold
          fontSize="xl"
          color={primaryTextColor}
          textAlign={isRTL ? "right" : "left"}
        >
          {t("edit_profile")}
        </Text>
        <Box w={6} />
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Name Input */}
        <VStack space={3} mb={4}>
          <Text
            color={primaryTextColor}
            bold
            textAlign={isRTL ? "right" : "left"}
          >
            {t("name")}
          </Text>
          <Input
            variant="filled"
            bgColor={inputBgColor}
            color={primaryTextColor}
            value={name}
            onChangeText={setName}
            placeholder={t("edit_name")}
            placeholderTextColor={secondaryTextColor}
            textAlign={isRTL ? "right" : "left"}
            _focus={{ borderColor: primaryTextColor }}
            borderColor={borderColor}
          />
        </VStack>

        {/* Address Section */}
        <VStack space={3} mb={4}>
          <Text
            color={primaryTextColor}
            bold
            textAlign={isRTL ? "right" : "left"}
          >
            {t("address")}
          </Text>
          {/* City Dropdown */}
          <Box
            flexDirection={isRTL ? "row-reverse" : "row"}
            alignItems="center"
            px={4}
            borderWidth={1}
            borderColor={borderColor}
            rounded="8px"
            bgColor={inputBgColor}
          >
            <Select
              flex={1}
              variant="unstyled"
              selectedValue={selectedCity}
              placeholder={isRTL ? "اختر المدينة" : "Select City"}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
              _selectedItem={{
                bg: "amber.100",
              }}
              textAlign={isRTL ? "right" : "left"}
              color={primaryTextColor}
              placeholderTextColor={secondaryTextColor}
            >
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
            <Location size="24" color={iconColor} />
          </Box>

          {/* Address Details Input */}
          <Box
            flexDirection={isRTL ? "row-reverse" : "row"}
            alignItems="center"
            px={4}
            borderWidth={1}
            borderColor={borderColor}
            rounded="8px"
            bgColor={inputBgColor}
            mt={2}
          >
            <Input
              flex={1}
              variant="unstyled"
              value={addressDetails}
              onChangeText={setAddressDetails}
              placeholder={isRTL ? "تفاصيل العنوان (مثال: شارع ١٢٣)" : "Address Details (e.g., Street 123)"}
              placeholderTextColor={secondaryTextColor}
              _focus={{ borderColor: primaryTextColor }}
              textAlign={isRTL ? "right" : "left"}
              color={primaryTextColor}
            />
            <Location size="24" color={iconColor} />
          </Box>
        </VStack>

        <Divider bgColor={dividerColor} />

        {/* Save Button */}
        <Button
          mt={6}
          bgColor={buttonBgColor}
          onPress={saveChanges}
          _text={{ color: buttonTextColor, fontWeight: "bold" }}
        >
          {t("save_changes")}
        </Button>
      </ScrollView>
    </Stack>
  );
};

export default Profil;