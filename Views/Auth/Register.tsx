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
} from "native-base";
import { StatusBar } from "expo-status-bar";
import { UserSquare, Mobile, Lock } from "iconsax-react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const validatePhoneNumber = (phone: string): string => {
  // Remove spaces, hyphens, and parentheses for processing
  let processedPhone = phone.replace(/[\s\-()]/g, '');
  
  // Case 1: Handle +9620 format (remove the 0 after +962)
  if (/^\+9620[678]/.test(processedPhone)) {
    processedPhone = '+962' + processedPhone.substring(5);
  }
  
  // Case 2: Handle 009620 format
  if (/^009620[678]/.test(processedPhone)) {
    processedPhone = '+962' + processedPhone.substring(6);
  }
  
  // Remove all non-digit characters for further processing
  const cleanedPhone = processedPhone.replace(/\D/g, '');

  // Handle international format (+962)
  if (processedPhone.startsWith('+962')) {
    if (/^\+962(7\d{8}|6\d{7}|8\d{7})$/.test(processedPhone)) {
      return processedPhone;
    }
  }

  // Handle 00962 prefix
  if (cleanedPhone.startsWith('00962')) {
    const formattedPhone = `+962${cleanedPhone.slice(5)}`;
    if (/^\+962(7\d{8}|6\d{7}|8\d{7})$/.test(formattedPhone)) {
      return formattedPhone;
    }
  }

  // Handle local formats with leading 0 (e.g., 07, 06, 08)
  if (/^0[678]\d+$/.test(cleanedPhone)) {
    return `+962${cleanedPhone.slice(1)}`;
  }

  // Handle numbers without leading 0 (e.g., 7, 6, 8 followed by 8 or 9 digits)
  if (/^(7\d{8}|6\d{7}|8\d{7})$/.test(cleanedPhone)) {
    return `+962${cleanedPhone}`;
  }

  // If no valid format is found, throw an error
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
  const [isPressed, setIsPressed] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const isArabic = i18n.language === "ar";

  const showToast = (message: string, bgColor: string) => {
    toast.show({
      placement: "top",
      render: () => (
        <Box
          bg={bgColor}
          px="2"
          py="1"
          rounded="sm"
          _text={{ color: "light.100" }}>
          {message}
        </Box>
      ),
    });
  };

  const handlePhoneChange = (text: string) => {
    // Special handling to allow + at the beginning
    let processedText = text;
    
    // If the text starts with + and it's not at the first position, remove previous +
    if (processedText.indexOf('+') > 0) {
      processedText = processedText.replace(/\+/g, '');
    }
    
    // Only allow numeric input and +
    const numericText = processedText.replace(/[^\d+]/g, '');
    
    // Ensure + is at the start if present
    const formattedText = numericText.startsWith('+') 
      ? numericText 
      : (numericText.length > 0 ? `+${numericText}` : '');

    setPhoneNumber(formattedText);
    
    // Validate phone number if it's not just a + sign
    if (formattedText && formattedText !== '+') {
      try {
        validatePhoneNumber(formattedText);
        setPhoneError('');
      } catch (error) {
        setPhoneError(error.message);
      }
    }
  };

  const handleRegister = async () => {
    // Validate inputs
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

    try {
      // Validate and format phone number
      const formattedPhone = validatePhoneNumber(phoneNumber);

      const response = await axios.post(
        "https://backend.j-byu.shop/api/register",
        {
          name: username,
          phone: formattedPhone,
          password: password,
        }
      );

      if (response.status === 201) {
        showToast(t("registration_successful"), "#F7CF9D");
        navigation.navigate("Confirmation", { phone: formattedPhone });
      }
    } catch (error) {
      let errorMessage = t("registration_failed");

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;

        // Handle specific status codes
        if (error.response?.status === 400) {
          errorMessage = t("invalid_registration_data");
        }
      }

      console.log(error.response.data)
      showToast(errorMessage, "red.500");
    }
  };

  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#333333" : "#E9E9F1";
  const hintColor = isDarkMode ? "#FFFFFF" : "#333";

  return (
    <VStack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
      flex={1}>
      <ScrollView>
        <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
        <Stack w="full" justifyContent="center" alignItems="center">
          <Text fontWeight={700} fontSize="16px" color={textColor}>
            {t("new_registration")}
          </Text>
        </Stack>

        <VStack space="14px" flex={1} mt="50px" mb={10}>
          {/* Username Input */}
          <Text color={textColor} fontFamily="Alexandria_500Medium">
            {t("username")}
          </Text>
          <Box
            flexDirection={isArabic ? "row-reverse" : "row"}
            alignItems="center"
            px={4}
            borderWidth={1}
            borderColor={inputBorderColor}
            rounded="8px">
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
            <UserSquare size="24" color="#F7CF9D" />
          </Box>

          {/* Phone Number Input */}
          <Text color={textColor}>{t("phone_number")}</Text>
          <Box
            flexDirection={isArabic ? "row-reverse" : "row"}
            alignItems="center"
            px={4}
            borderWidth={1}
            borderColor={phoneError ? "red.500" : inputBorderColor}
            rounded="8px">
            <Input
              placeholder={t("phone_placeholder")}
              textAlign={isArabic ? "right" : "left"}
              flex={1}
              value={phoneNumber}
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
            <Mobile size="26" color="#F7CF9D" />
          </Box>
          {phoneError && (
            <Text color="red.500" fontSize="xs" ml={2}>
              {phoneError}
            </Text>
          )}

          {/* Password Input */}
          <Text color={textColor}>{t("password")}</Text>
          <Box
            flexDirection={isArabic ? "row-reverse" : "row"}
            alignItems="center"
            px={4}
            borderWidth={1}
            borderColor={inputBorderColor}
            rounded="8px">
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
            <Lock size="24" color="#F7CF9D" />
          </Box>

          {/* Login Text */}
          <HStack
            alignItems="center"
            space="2px"
            flexDirection={isArabic ? "row" : "row-reverse"}>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text fontSize="12px" color="#F7CF9D">
                {t("login")}
              </Text>
            </Pressable>

            <Text ml="1px" fontSize="12px" color={hintColor}>
              {t("have_account")}
            </Text>
          </HStack>
        </VStack>
      </ScrollView>

      {/* Register Button */}
      <VStack>
        <Button
          width="full"
          backgroundColor={isPressed ? "#F9D77E" : "#F7CF9D"}
          rounded="12px"
          mt="20px"
          py="16px"
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleRegister}>
          <Text fontSize="16px" fontFamily="Alexandria_700Bold" color="white">
            {t("register")}
          </Text>
        </Button>
      </VStack>
    </VStack>
  );
}