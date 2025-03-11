import React, { useState } from "react";
import {
  StatusBar as RNStatusBar,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
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
import { useDispatch } from "react-redux";
import { setPassHome } from "../../store/PassHomeSlice";
import { StatusBar } from "expo-status-bar";
import { Mobile, Eye, EyeSlash } from "iconsax-react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RecoveryPassword() {
  const navigation = useNavigation();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(120);
  const isArabic = i18n.language === "ar";

  const showToast = (message: any, bgColor: any) => {
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

  const verifyCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://backend.j-byu.shop/api/verify-code",
        {
          phone: phoneNumber,
          code: code,
        }
      );
      console.log(response.data);

      if (response.data.verified) {
        await AsyncStorage.setItem("sessionToken", response.data.sessionToken);
        await AsyncStorage.setItem("userId", response.data.userId.toString());

        showToast(t("verification_success"), "green.500");
        setStep(3);
      }
    } catch (error: any) {
      console.log(error.response.data);
      showToast(
        error.response?.data?.message || t("verification_error"),
        "red.500"
      );
    }
  };

  const resendVerificationCode = async () => {
    try {
      await axios.post(
        "https://backend.j-byu.shop/api/resend-verification-code",
        { phone: phoneNumber }
      );

      setTimer(120);
      setCanResend(false);
      setStep(2);
      showToast(t("code_resent"), "green.500");
    } catch (error: any) {
      showToast(error.response?.data?.message || t("resend_error"), "red.500");
    }
  };

  const handleNext = () => {
    if (step === 1) {
      try {
        const validatedPhone = validatePhoneNumber(phoneNumber);
        setPhoneNumber(validatedPhone);
        resendVerificationCode();
      } catch (error) {
        showToast(t("invalid_phone_number"), "red.500");
      }
    } else if (step === 2) {
      if (!code.trim()) {
        showToast(t("code_required"), "red.500");
        return;
      }
      verifyCode(code);
    } else if (step === 3) {
      if (!password.trim()) {
        showToast(t("password_required"), "red.500");
        return;
      }
      handleResetPassword();
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post(
        "https://backend.j-byu.shop/api/reset-password",
        {
          phone: phoneNumber,
          newPassword: password,
        }
      );

      toast.show({
        placement: "top",
        render: () => (
          <Box
            bg="green.500"
            px="2"
            py="1"
            rounded="sm"
            _text={{ color: "#FFFFFF" }}
          >
            {t("password_reset_successful")}
          </Box>
        ),
      });

      dispatch(setPassHome(true));
    } catch (error: any) {
      toast.show({
        placement: "top",
        render: () => (
          <Box
            bg="red.500"
            px="2"
            py="1"
            rounded="sm"
            _text={{ color: "#FFFFFF" }}
          >
            {error.response?.data?.message || t("reset_password_error")}
          </Box>
        ),
      });
    }
  };

  // Define black-and-white color scheme
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#FFFFFF" : "#000000"; // Updated to black/white
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF"; // Background
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000"; // Icons
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000"; // Button background
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF"; // Button text (inverted)
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333"; // Pressed state
  const disabledButtonColor = isDarkMode ? "#666666" : "#999999"; // Disabled resend button

  return (
    <VStack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]} // Direct background
      flex={1}
    >
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
      <Stack w="full" justifyContent="center" alignItems="center">
        <Text fontWeight={700} fontSize="16px" color={textColor}>
          {t("recovery_password")}
        </Text>
      </Stack>

      <VStack space="14px" flex={1} mt="50px" mb={10}>
        {step === 1 && (
          <>
            <Text textAlign={isArabic ? "right" : "left"} color={textColor}>
              {t("enter_phone")}
            </Text>
            <Input
              placeholder={t("phone_placeholder")}
              value={phoneNumber}
              defaultValue="+962"
              onChangeText={setPhoneNumber}
              borderColor={inputBorderColor}
              keyboardType="phone-pad"
              color={textColor}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text textAlign={isArabic ? "right" : "left"} color={textColor}>
              {t("enter_code", { phone: phoneNumber })}
            </Text>
            <Input
              placeholder={t("code_placeholder")}
              value={code}
              onChangeText={setCode}
              borderColor={inputBorderColor}
              color={textColor}
            />
            <Button
              onPress={resendVerificationCode}
              disabled={!canResend}
              backgroundColor={canResend ? buttonBgColor : disabledButtonColor}
            >
              <Text color={canResend ? buttonTextColor : "#FFFFFF"}>
                {t("resend_code")}
              </Text>
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Text textAlign={isArabic ? "right" : "left"} color={textColor}>
              {t("new_password")}
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
                flex={1}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                variant="unstyled"
                bg="transparent"
                color={textColor}
              />
              <Pressable
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Icon
                  as={isPasswordVisible ? <EyeSlash /> : <Eye />}
                  color={iconColor}
                  size="26"
                />
              </Pressable>
            </Box>
          </>
        )}
      </VStack>

      <Button
        width="full"
        backgroundColor={isPressed ? buttonPressedBgColor : buttonBgColor}
        rounded="12px"
        py="16px"
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={handleNext}
      >
        <Text fontSize="16px" fontFamily="Alexandria_700Bold" color={buttonTextColor}>
          {step === 3 ? t("reset_password") : t("next")}
        </Text>
      </Button>
    </VStack>
  );
}