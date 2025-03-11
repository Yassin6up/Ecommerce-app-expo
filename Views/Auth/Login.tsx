import React, { useState } from "react";
import axios from "axios";
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
        const validatedPhone = validatePhoneNumber(formattedText);
        setPhoneNumber(validatedPhone);
        setPhoneError('');
      } catch (error: any) {
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
          navigation.navigate("Confirmation", { phone: formattedPhone });
          return;
        }

        await AsyncStorage.setItem("sessionToken", sessionToken);
        await AsyncStorage.setItem("userId", userId.toString());
        showToast(t("login_successful"), isDarkMode ? "#FFFFFF" : "#000000");
        dispatch(setPassHome(true));
        // navigation.navigate("page one", {});
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message || t("login failed");
        showToast(errorMessage, "red.500");
        if (error.response.status === 403 && error.response.data.message === "User not verified") {
          navigation.navigate("Confirmation", { phone: phoneNumber });
        }
      } else {
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
          _text={{ color: "#FFFFFF" }} // White text for contrast
        >
          {message}
        </Box>
      ),
    });
  };

  // Define black-and-white color scheme
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#FFFFFF" : "#000000"; // Updated to black/white
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF"; // Background
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000"; // Icons
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000"; // Button background
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF"; // Button text (inverted)
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333"; // Pressed state

  return (
    <VStack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]} // Direct background
      flex={1}
    >
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size="32" color={iconColor} />
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
        <Text textAlign={isArabic ? "right" : "left"} color={textColor}>
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
              color={iconColor}
              size="26"
            />
          </Pressable>
        </Box>
        {/* Forgot Password */}
        <Pressable onPress={() => navigation.navigate("recoveryPassword")} mt="5px">
          <Text
            fontSize="14px"
            textAlign={isArabic ? "right" : "left"}
            color={buttonBgColor} // Matches button for consistency
            underline
          >
            {t("forgot_password")}
          </Text>
        </Pressable>
      </VStack>
      <Button
        width="full"
        backgroundColor={isPressed ? buttonPressedBgColor : buttonBgColor}
        rounded="12px"
        mt="84px"
        py="16px"
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={login}
      >
        <Text fontSize="16px" fontFamily="Alexandria_700Bold" color={buttonTextColor}>
          {t("login")}
        </Text>
      </Button>
    </VStack>
  );
}