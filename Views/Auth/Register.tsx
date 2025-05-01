import React, { useState } from "react";
import { StatusBar as RNStatusBar, Platform } from "react-native";
import styles from "../Styles";
import {
  VStack,
  Text,
  Stack,
  Input,
  Box,
  HStack,
  Pressable,
  Button,
  useToast,
  ScrollView,
  FormControl,
  Select,
} from "native-base";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "iconsax-react-native";
import { UserSquare, Mobile, Lock, Location } from "iconsax-react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const validatePhoneNumber = (phone: string): string => {
  let processedPhone = phone.replace(/[\s\-()]/g, '');
  if (/^\+9620[678]/.test(processedPhone)) {
    processedPhone = '+962' + processedPhone.substring(5);
  }
  if (/^009620[678]/.test(processedPhone)) {
    processedPhone = '+962' + processedPhone.substring(6);
  }
  const cleanedPhone = processedPhone.replace(/\D/g, '');
  if (processedPhone.startsWith('+962')) {
    if (/^\+962(7\d{8}|6\d{7}|8\d{7})$/.test(processedPhone)) {
      return processedPhone;
    }
  }
  if (cleanedPhone.startsWith('00962')) {
    const formattedPhone = `+962${cleanedPhone.slice(5)}`;
    if (/^\+962(7\d{8}|6\d{7}|8\d{7})$/.test(formattedPhone)) {
      return formattedPhone;
    }
  }
  if (/^0[678]\d+$/.test(cleanedPhone)) {
    return `+962${cleanedPhone.slice(1)}`;
  }
  if (/^(7\d{8}|6\d{7}|8\d{7})$/.test(cleanedPhone)) {
    return `+962${cleanedPhone}`;
  }
  throw new Error('Invalid Jordanian phone number');
};

export default function Register() {
  const toast = useToast();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();

  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const isArabic = i18n.language === "ar";

  const fullAddress = selectedCity && addressDetails 
    ? `${selectedCity}, ${addressDetails}` 
    : selectedCity || addressDetails || "";

  const showToast = (message: string, bgColor: string) => {
    toast.show({
      placement: "top",
      render: () => (
        <Box
          bg={bgColor}
          px="2"
          py="1"
          rounded="sm"
          _text={{ color: "#FFFFFF" }} // White text for contrast
        >
          {message}
        </Box>
      ),
    });
  };

  const handlePhoneChange = (text: string) => {
    let processedText = text;
    if (processedText.indexOf('+') > 0) {
      processedText = processedText.replace(/\+/g, '');
    }
    const numericText = processedText.replace(/[^\d+]/g, '');
    const formattedText = numericText.startsWith('+') 
      ? numericText 
      : (numericText.length > 0 ? `+${numericText}` : '');
    setPhoneNumber(formattedText);
    if (formattedText && formattedText !== '+') {
      try {
        validatePhoneNumber(formattedText);
        setPhoneError('');
      } catch (error: any) {
        setPhoneError(error.message);
      }
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      showToast(t("username_required"), "red.500");
      return;
    }
    if (!phoneNumber.trim()) {
      showToast(t("phone_required"), "red.500");
      return;
    }
    if (phoneError) {
      showToast(phoneError, "red.500");
      return;
    }
    if (!password.trim()) {
      showToast(t("password_required"), "red.500");
      return;
    }
    if (!fullAddress.trim()) {
      showToast(t("address_required"), "red.500");
      return;
    }

    try {
      const formattedPhone = validatePhoneNumber(phoneNumber);
      const response = await axios.post(
        "https://backend.j-byu.shop/api/register",
        {
          name: username,
          phone: formattedPhone,
          password: password,
          address: fullAddress,
        }
      );
      if (response.status === 201) {
        showToast(t("registration_successful"), isDarkMode ? "#FFFFFF" : "#000000"); // Black/white for success
        navigation.navigate("Confirmation", { phone: formattedPhone });
      }
    } catch (error: any) {
      let errorMessage = t("registration_failed");
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
        if (error.response?.status === 400) {
          errorMessage = t("invalid_registration_data");
        }
      }
      console.log(error.response?.data);
      showToast(errorMessage, "red.500");
    }
  };

  // Define black-and-white color scheme
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#FFFFFF" : "#000000"; // Updated to black/white
  const hintColor = isDarkMode ? "#FFFFFF" : "#000000"; // Updated to black/white
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF"; // Background
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000"; // Icons
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000"; // Button background
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF"; // Button text (inverted for contrast)
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333"; // Slightly off black/white for pressed state

  return (
    <VStack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]} // Direct background color
      flex={1}
    >
            <Stack w={"full"} mb={4} position={"fixed"}>
              <Pressable onPress={() => navigation.goBack()}>
                <ArrowLeft size="32" color={iconColor} />
              </Pressable>
            </Stack>
      <ScrollView>
        <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
        <Stack w="full" justifyContent="center" alignItems="center">
          <Text fontWeight={700} fontSize="16px" color={textColor}>
            {t("new_registration")}
          </Text>
        </Stack>
<ScrollView>
<VStack space="14px" flex={1} mt="50px" mb={10}>
 
 <Text
   color={textColor}
   textAlign={isArabic ? "right" : "left"}
   fontFamily="Alexandria_500Medium"
 >
   {t("username")}
 </Text>
 <Box
   flexDirection={isArabic ? "row-reverse" : "row"}
   alignItems="center"
   px={4}
   borderWidth={1}
   borderColor={inputBorderColor}
   rounded="8px"
 >
   <Input
     placeholder={t("username_placeholder")}
     flex={1}
     variant="unstyled"
     value={username}
     onChangeText={setUsername}
     _focus={{
       backgroundColor: "transparent",
       borderColor: "transparent",
     }}
     bg="transparent"
     borderWidth={0}
     textAlign={isArabic ? "right" : "left"}
     color={textColor}
   />
   <UserSquare size="24" color={iconColor} />
 </Box>

 {/* Phone Number Input */}
 <Text color={textColor} textAlign={isArabic ? "right" : "left"}>
   {t("phone_number")}
 </Text>
 <Box
   flexDirection={isArabic ? "row-reverse" : "row"}
   alignItems="center"
   px={4}
   borderWidth={1}
   borderColor={phoneError ? "red.500" : inputBorderColor}
   rounded="8px"
 >
   <Input
     placeholder={t("phone_placeholder")}
     textAlign={isArabic ? "right" : "left"}
     flex={1}
     value={phoneNumber}
     defaultValue="+962"
     onChangeText={handlePhoneChange}
     keyboardType="phone-pad"
     variant="unstyled"
     _focus={{
       backgroundColor: "transparent",
       borderColor: "transparent",
     }}
     bg="transparent"
     borderWidth={0}
     color={textColor}
   />
   <Mobile size="26" color={iconColor} />
 </Box>
 {phoneError && (
   <Text color="red.500" fontSize="xs" ml={2}>
     {phoneError}
   </Text>
 )}

 {/* Password Input */}
 <Text color={textColor} textAlign={isArabic ? "right" : "left"}>
   {t("password")}
 </Text>
 <Box
   flexDirection={isArabic ? "row-reverse" : "row"}
   alignItems="center"
   px={4}
   borderWidth={1}
   borderColor={inputBorderColor}
   rounded="8px"
 >
   <Input
     placeholder={t("password_placeholder")}
     secureTextEntry
     flex={1}
     variant="unstyled"
     value={password}
     onChangeText={setPassword}
     _focus={{
       backgroundColor: "transparent",
       borderColor: "transparent",
     }}
     bg="transparent"
     borderWidth={0}
     textAlign={isArabic ? "right" : "left"}
     color={textColor}
   />
   <Lock size="24" color={iconColor} />
 </Box>

 {/* Address Section */}
 <Text color={textColor} textAlign={isArabic ? "right" : "left"}>
   {t("address")}
 </Text>
 {/* City Dropdown */}
 <Box
   flexDirection={isArabic ? "row-reverse" : "row"}
   alignItems="center"
   px={4}
   borderWidth={1}
   borderColor={inputBorderColor}
   rounded="8px"
 >
   <Select
     flex={1}
     variant="unstyled"
     selectedValue={selectedCity}
     placeholder={isArabic ? "اختر المدينة" : "Select City"}
     onValueChange={(itemValue) => setSelectedCity(itemValue)}
     _selectedItem={{
       bg: "amber.100", // Match button color
     }}
     textAlign={isArabic ? "right" : "left"}
     color={textColor}
   >
     <Select.Item label={isArabic ? "عمان" : "Amman"} value="Amman" />
     <Select.Item label={isArabic ? "إربد" : "Irbid"} value="Irbid" />
     <Select.Item label={isArabic ? "البلقاء" : "Balqa"} value="Balqa" />
     <Select.Item label={isArabic ? "الكرك" : "Karak"} value="Karak" />
     <Select.Item label={isArabic ? "معان" : "Ma'an"} value="Ma'an" />
     <Select.Item label={isArabic ? "الزرقاء" : "Zarqa"} value="Zarqa" />
     <Select.Item label={isArabic ? "المفرق" : "Mafraq"} value="Mafraq" />
     <Select.Item label={isArabic ? "الطفيلة" : "Tafilah"} value="Tafilah" />
     <Select.Item label={isArabic ? "مادبا" : "Madaba"} value="Madaba" />
     <Select.Item label={isArabic ? "جرش" : "Jerash"} value="Jerash" />
     <Select.Item label={isArabic ? "عجلون" : "Ajloun"} value="Ajloun" />
     <Select.Item label={isArabic ? "العقبة" : "Aqaba"} value="Aqaba" />
   </Select>
   <Location size="24" color={iconColor} />
 </Box>

 {/* Address Details Input */}
 <Box
   flexDirection={isArabic ? "row-reverse" : "row"}
   alignItems="center"
   px={4}
   borderWidth={1}
   borderColor={inputBorderColor}
   rounded="8px"
   mt={2}
 >
   <Input
     placeholder={isArabic ? "تفاصيل العنوان (مثال: شارع ١٢٣)" : "Address Details (e.g., Street 123)"}
     flex={1}
     variant="unstyled"
     value={addressDetails}
     onChangeText={setAddressDetails}
     _focus={{
       backgroundColor: "transparent",
       borderColor: "transparent",
     }}
     bg="transparent"
     borderWidth={0}
     textAlign={isArabic ? "right" : "left"}
     color={textColor}
   />
   <Location size="24" color={iconColor} />
 </Box>

 {/* Login Text */}
 <HStack
   alignItems="center"
   space="2px"
   flexDirection={isArabic ? "row" : "row-reverse"}
 >
   <Pressable onPress={() => navigation.navigate("Login")}>
     <Text fontSize="12px" color={buttonBgColor}>
       {t("login")}
     </Text>
   </Pressable>
   <Text ml="1px" fontSize="12px" color={hintColor}>
     {t("have_account")}
   </Text>
 </HStack>
</VStack>
</ScrollView>
      
      </ScrollView>

      {/* Register Button */}
      <VStack>
        <Button
          width="full"
          backgroundColor={isPressed ? buttonPressedBgColor : buttonBgColor}
          rounded="12px"
          mb="30px"
          py="16px"
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleRegister}
        >
          <Text fontSize="16px" fontFamily="Alexandria_700Bold" color={buttonTextColor}>
            {t("register")}
          </Text>
        </Button>
      </VStack>
    </VStack>
  );
}