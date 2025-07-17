import React, { useState } from "react";
import axios from "axios";
import { StatusBar as RNStatusBar, Platform, TextInput } from "react-native";
import styles from "../Styles";
import {
  VStack,
  Text,
  Stack,
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define navigation param list (adjust based on your app's navigation structure)
type RootStackParamList = {
  Confirmation: { phone: string };
  Register: undefined;
  recoveryPassword: undefined;
  // Add other screens as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const validatePhoneNumber = (phone: string): string => {
  let processedPhone = phone.replace(/[\s\-()]/g, "");
  if (/^\+9620[678]/.test(processedPhone)) {
    processedPhone = "+962" + processedPhone.substring(5);
  }
  if (/^009620[678]/.test(processedPhone)) {
    processedPhone = "+962" + processedPhone.substring(6);
  }
  const cleanedPhone = processedPhone.replace(/\D/g, "");
  if (processedPhone.startsWith("+962")) {
    if (/^\+962(7\d{8}|6\d{7}|8\d{7})$/.test(processedPhone)) {
      return processedPhone;
    }
  }
  if (cleanedPhone.startsWith("00962")) {
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
  throw new Error("Invalid Jordanian phone number");
};

export default function Login() {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [phoneNumber, setPhoneNumber] = useState("+962");
  const [validatedPhone, setValidatedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const isArabic = i18n.language === "ar";

  const handlePhoneChange = (text: string) => {
    let processedText = text;
    if (processedText.indexOf("+") > 0) {
      processedText = processedText.replace(/\+/g, "");
    }
    const numericText = processedText.replace(/[^\d+]/g, "");
    const formattedText = numericText.startsWith("+")
      ? numericText
      : numericText.length > 0
      ? `+${numericText}`
      : "";
    setPhoneNumber(formattedText);
    if (formattedText && formattedText !== "+") {
      try {
        const validPhone = validatePhoneNumber(formattedText);
        setValidatedPhone(validPhone);
        setPhoneError("");
      } catch (error: any) {
        setValidatedPhone("");
        setPhoneError(t("invalid_phone_number"));
      }
    } else {
      setValidatedPhone("");
      setPhoneError("");
    }
  };

  const login = async () => {
    console.log("Login button pressed");
    console.log("PhoneNumber:", phoneNumber, "ValidatedPhone:", validatedPhone, "Password:", password);
  
    // Check if phone number is empty or invalid
    if (!phoneNumber.trim() || phoneNumber === "+962") {
      console.log("Phone number empty or invalid");
      showToast(t("phone_required"), "red.500");
      return;
    }
    if (!password.trim()) {
      console.log("Password empty");
      showToast(t("password_required"), "red.500");
      return;
    }
    if (!validatedPhone) {
      console.log("Validated phone not set");
      showToast(t("invalid_phone_number"), "red.500");
      return;
    }
  
    try {
      console.log("Making API call with phone:", validatedPhone);
      const response = await axios.post("https://backend.j-byu.shop/api/login", {
        phone: validatedPhone,
        password: password,
      });
  
      console.log("API response:", response.status, response.data);
  
      // Handle 200 or 202 status
      if (response.status === 200 || response.status === 202) {
        const { needVerification, sessionToken, userId } = response.data;
  
        if (needVerification) {
          console.log("Phone not verified, navigating to Confirmation");
          showToast(t("phone_not_verified"), "yellow.500");
          navigation.navigate("Confirmation", { phone: validatedPhone });
          return;
        }
  
        // Successful login (only for 200 status)
        if (response.status === 200) {
          console.log("Login successful");
          await AsyncStorage.setItem("sessionToken", sessionToken);
          await AsyncStorage.setItem("userId", userId.toString());
          showToast(t("login_successful"), "#000000");
          dispatch(setPassHome(true));
        }
      }
    } catch (error: any) {
      console.log("API call failed:", error.message, error.response?.data);
      let errorMessage = t("login_failed");
      if (error.response) {
        errorMessage = error.response.data?.message || t("login_failed");
        if (
          error.response.status === 403 &&
          error.response.data?.message === "User not verified"
        ) {
          console.log("403: User not verified, navigating to Confirmation");
          showToast(t("phone_not_verified"), "yellow.500");
          navigation.navigate("Confirmation", { phone: validatedPhone });
          return;
        }
      } else {
        errorMessage = t("network_error");
      }
      showToast(errorMessage, "red.500");
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
          _text={{ color: "#FFFFFF" }}
        >
          {message}
        </Box>
      ),
    });
  };

  // Define black-and-white color scheme
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333";

  return (
    <VStack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
      flex={1}
    >
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => dispatch(setPassHome(true))}>
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
          <TextInput
            placeholder={t("phone_placeholder")}
            style={{
              flex: 1,
              color: textColor,
              textAlign: isArabic ? "right" : "left",
              backgroundColor: "transparent",
              borderWidth: 0,
              height: 48, // or your preferred height
            }}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
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
  height={10}
>
  <TextInput
    placeholder={t("password_placeholder")}
    style={{
      flex: 1,
      color: textColor,
      textAlign: isArabic ? "right" : "left",
      backgroundColor: "transparent",
      borderWidth: 0,
      height: 48, // or your preferred height
    }}
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!isPasswordVisible}
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
        <Pressable
          onPress={() => navigation.navigate("recoveryPassword")}
          mt="5px"
        >
          <Text
            fontSize="14px"
            textAlign={isArabic ? "right" : "left"}
            color={buttonBgColor}
            underline
          >
            {t("forgot_password")}
          </Text>
        </Pressable>
        <Stack
          w="full"
          direction={isArabic ? "row-reverse" : "row"}
          justifyContent="center"
          alignItems="center"
          mt="20px"
        >
          <Text fontSize="14px" color={textColor}>
            {t("dont_have_account")}
          </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text fontSize="14px" color={buttonBgColor} underline ml="5px">
              {t("signup")}
            </Text>
          </Pressable>
        </Stack>
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
        <Text
          fontSize="16px"
          fontFamily="Alexandria_700Bold"
          color={buttonTextColor}
        >
          {t("login")}
        </Text>
      </Button>
    </VStack>
  );
}