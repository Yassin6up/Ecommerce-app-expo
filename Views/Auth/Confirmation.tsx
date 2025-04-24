import React, { useState, useEffect , useCallback , useRef} from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from "react-native";
import {
  Box,
  Button,
  FormControl,
  HStack,
  Stack,
  Text,
  VStack,
  WarningOutlineIcon,
  useToast,
  Pressable,
  Input,
} from "native-base";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { Formik } from "formik";
import styles from "../Styles";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { setPassHome } from "../../store/PassHomeSlice";
import { RootState } from "../../store/store";
import { ArrowLeft } from "iconsax-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Confirmation = ({ navigation, route }: any) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const toast = useToast();
  const [isPressed, setIsPressed] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  const { phone } = route.params;

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1);
      } else {
        setCanResend(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const validationSchema = yup.object().shape({
    otp: yup.string().required(t("otp_required")).length(6, t("otp_invalid")),
  });

  const initialValues = { otp: "" };

  const verifyCode = async (code: string) => {
    try {
      const response = await axios.post(
        "https://backend.j-byu.shop/api/verify-code",
        {
          phone: phone,
          code: code,
        }
      );
      console.log(response.data);

      if (response.data.verified) {
        await AsyncStorage.setItem("sessionToken", response.data.sessionToken);
        await AsyncStorage.setItem("userId", response.data.userId.toString());

        dispatch(setPassHome(true));

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
              {t("verification_success")}
            </Box>
          ),
        });
      }
    } catch (error: any) {
      console.log(error.response.data);
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
            {error.response?.data?.message || t("verification_error")}
          </Box>
        ),
      });
    }
  };

  const resendVerificationCode = async () => {
    try {
      await axios.post(
        "https://backend.j-byu.shop/api/resend-verification-code",
        { phone }
      );

      setTimer(120);
      setCanResend(false);

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
            {t("code_resent")}
          </Box>
        ),
      });
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
            {error.response?.data?.message || t("resend_error")}
          </Box>
        ),
      });
    }
  };




  const handleSubmit = async (values: any) => {
    await verifyCode(values.otp);
  };
  // Define black-and-white color scheme
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBorderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const buttonPressedBgColor = isDarkMode ? "#CCCCCC" : "#333333";

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };


  // Inside your component
const inputRef = useRef<TextInput>(null);




const CustomInput = React.forwardRef<TextInput>((props, ref) => {
  const internalRef = useRef<TextInput>(null);
  
  // Merge forwarded ref with internal ref
  React.useImperativeHandle(ref, () => ({
    ...(internalRef.current as TextInput),
    keepFocus: () => {
      internalRef.current?.focus();
      setTimeout(() => internalRef.current?.focus(), 100);
    }
  }));

  return ( <Input {...props}   ref={(el: any) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(el?._input);
      } else {
        (ref as React.MutableRefObject<any>).current = el?._input;
      }
    } }}/> )

});


useEffect(() => {
  const showSub = Keyboard.addListener('keyboardDidShow', () => {
    inputRef.current?.keepFocus(); // Use custom focus method
  });
  return () => showSub.remove();
}, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Critical for iOS
      keyboardVerticalOffset={Platform.OS === "android" ? -100 : 0}
      style={{ flex: 1 }}
      onLayout={(e) => {
        console.log('Layout height:', e.nativeEvent.layout.height);
      }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack
          style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
          flex={1}
        >
          <StatusBar style="auto" />
          <Stack w={"full"} mb={4} position={"fixed"}>
            <Pressable onPress={() => navigation.goBack()}>
              <ArrowLeft size="32" color={iconColor} />
            </Pressable>
          </Stack>
          <Stack w="full" justifyContent="center" alignItems="center">
            <Text fontWeight={700} fontSize="16px" color={textColor}>
              {t("confirm_code")}
            </Text>
          </Stack>

          <Stack h="full" w="full">
            <Stack w="full" justifyContent="center" alignItems="center" mt={10}>
              <Text color={textColor}>{t("enter_code", { phone: phone })}</Text>
            </Stack>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleSubmit, errors, touched, setFieldValue, values }) => {
                const handleOtpChange = useCallback((text: string) => {
                  const digitsOnly = text.replace(/\D/g, '').slice(0, 6);
                  setFieldValue("otp", digitsOnly);

                  if (digitsOnly.length === 6) {
                    if (Platform.OS === 'ios') {
                      // Small delay for iOS keyboard stability
                      setTimeout(() => Keyboard.dismiss(), 100);
                    } else {
                      Keyboard.dismiss();
                    }
                  }
                }, [setFieldValue]); // Dependency array

                return <>
                  <VStack space="16px">
                    <FormControl
                      isInvalid={!!(errors.otp && touched.otp)}
                      marginTop="48px"
                    >
                      <Stack alignItems="center" justifyContent="center">
                        <CustomInput   value={values.otp}
                                onChangeText={handleOtpChange}
                                ref={inputRef}
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                                fontSize="24px"
                                onBlur={(e) => {
                                  if (Platform.OS === 'ios' && values.otp.length < 6) {
                                    // Prevent blur until OTP is complete
                                    inputRef.current?.focus();
                                  }
                                }}
                                width="200px"
                                borderBottomWidth="2"
                                autoComplete="sms-otp"
                                textContentType="oneTimeCode"
                                borderBottomColor={inputBorderColor}
                                color={textColor}
                                _focus={{
                                  borderBottomColor: inputBorderColor,
                                }}
                                letterSpacing="8px"
                                fontWeight="bold"
                                variant="underlined"
                                placeholder="••••••" />
                      </Stack>
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                      >
                        {errors.otp}
                      </FormControl.ErrorMessage>
                    </FormControl>
                  </VStack>

                  <HStack
                    paddingTop="24px"
                    w="full"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {!canResend ? (
                      <Text color={textColor}>
                        {t("resend_in")} {formatTimer()}
                      </Text>
                    ) : (
                      <Text color={textColor}>
                        {t("did_not_receive_code")}
                        <Text
                          underline
                          style={{ color: buttonBgColor }}
                          onPress={resendVerificationCode}
                        >
                          {" "}
                          {t("resend")}
                        </Text>
                      </Text>
                    )}
                  </HStack>

                  <VStack
                    my="32px"
                    space="20px"
                    alignItems="center"
                    bottom={20}
                    left={-3}
                    position="absolute"
                    width="full"
                  >
                    <Button
                      width="full"
                      backgroundColor={
                        isPressed ? buttonPressedBgColor : buttonBgColor
                      }
                      rounded="12px"
                      mt="20px"
                      py="16px"
                      onPressIn={() => setIsPressed(true)}
                      onPressOut={() => setIsPressed(false)}
                      isDisabled={values.otp.length < 6}
                      onPress={() => handleSubmit()}
                    >
                      <HStack
                        alignItems="center"
                        justifyContent="space-between"
                        w="full"
                      >
                        <Text
                          fontSize="16px"
                          fontFamily="Alexandria_700Bold"
                          color={buttonTextColor}
                        >
                          {t("confirm")}
                        </Text>
                      </HStack>
                    </Button>
                  </VStack>
                </>
              }}
            </Formik>
          </Stack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Confirmation;