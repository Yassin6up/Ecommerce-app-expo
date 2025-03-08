import React, { useState } from "react";
import axios from "axios"; // Import Axios for API calls
import { StatusBar as RNStatusBar, Platform } from "react-native";
import styles from "../Styles";
import {
  VStack,
  Text,
  Stack,
  Input,
  Box,
  Button,
  Icon,
  useToast,
  Pressable,
} from "native-base";
import { StatusBar } from "expo-status-bar";
import { Mobile, Eye, EyeSlash, ArrowLeft } from "iconsax-react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import { setPassHome } from "../../store/PassHomeSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// Utility function for phone number validation

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

export default function Login() {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigation: any = useNavigation();

  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const isArabic = i18n.language === "ar";

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
        const validatedPhone = validatePhoneNumber(formattedText);
        setPhoneNumber(validatedPhone); // Update with validated and formatted phone number
        setPhoneError('');
      } catch (error:any) {
        setPhoneError(error.message);
      }
    } else {
      setPhoneError('');
    }
  };

  const login = async () => {
    if (!phoneNumber.trim()) {
      showToast(t("phone_required"), "red.500");
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
        "https://backend.j-byu.shop/api/login",
        {
          phone: formattedPhone,
          password: password,
        }
      );

      if (response.status === 200) {
        const { sessionToken, userId, needVerification } = response.data;

        if (needVerification) {
          // Redirect to confirmation page if user is not verified
          navigation.navigate("Confirmation", { phone: formattedPhone });
          return;
        }

        // Save sessionToken and userId in localStorage
        await AsyncStorage.setItem("sessionToken", sessionToken);
        await AsyncStorage.setItem("userId", userId.toString());
        // Show success message
        showToast(t("login_successful"), "#F7CF9D");

        // Dispatch action to update Redux state
        dispatch(setPassHome(true));

        // Redirect to home page
        // navigation.navigate("page one" , {});
      }
    } catch (error: any) {
      if (error.response) {
        // Handle specific error responses
        const errorMessage = error.response.data.message || t("login failed");
        showToast(errorMessage, "red.500");

        // Redirect to confirmation page if user is not verified
        if (error.response.status === 403 && error.response.data.message === "User not verified") {
          navigation.navigate("Confirmation", { phone: phoneNumber });
        }
      } else {
        // Handle network or other errors
        showToast(t("network error"), "red.500");
      }
    }
  };

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

  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#333333" : "#E9E9F1";

  return (
    <VStack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
      flex={1}>
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size="32" color="#F7CF9D" />
        </Pressable>
      </Stack>
      <Stack w="full" justifyContent="center" alignItems="center">
        <Text fontWeight={700} fontSize="16px" color={textColor}>
          {t("login")}
        </Text>
      </Stack>
      <VStack space="14px" flex={1} mt="50px" mb={10}>
        {/* Phone Number Input */}
        <Text textAlign={isArabic ? "right" : "left"} color={textColor}>
          {t("phone_number")}
        </Text>
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
          <Mobile size="26" color="#F7CF9D" />
        </Box>
        {phoneError && (
          <Text color="red.500" fontSize="xs" ml={2}>
            {phoneError}
          </Text>
        )}

        {/* Password Input */}
        <Text textAlign={isArabic ? "right" : "left"} color={textColor}>
          {t("password")}
        </Text>
        <Box
          flexDirection={isArabic ? "row-reverse" : "row"}
          alignItems="center"
          px={4}
          borderWidth={1}
          borderColor={inputBorderColor}
          rounded="8px">
          <Input
            placeholder={t("password_placeholder")}
            textAlign={isArabic ? "right" : "left"}
            flex={1}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            variant="unstyled"
            _focus={{
              backgroundColor: "transparent",
              borderColor: "transparent",
            }}
            bg="transparent"
            borderWidth={0}
            color={textColor}
          />
          <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Icon
              as={isPasswordVisible ? <EyeSlash /> : <Eye />}
              color="#F7CF9D"
              size="26"
            />
          </Pressable>
        </Box>
        {/* Forgot Password */}
        <Pressable onPress={() => navigation.navigate("recoveryPassword")} mt="5px">
          <Text
            fontSize="14px"
            textAlign={isArabic ? "right" : "left"}
            color="#F7CF9D"
            underline>
            {t("forgot_password")}
          </Text>
        </Pressable>
      </VStack>
      <Button
        width="full"
        backgroundColor={isPressed ? "#F9D77E" : "#F7CF9D"}
        rounded="12px"
        mt="84px"
        py="16px"
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={login}>
        <Text fontSize="16px" fontFamily="Alexandria_700Bold" color="white">
          {t("login")}
        </Text>
      </Button>
    </VStack>
  );
}