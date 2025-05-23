import React,{useEffect} from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styles from "../Styles";
import { ArrowLeft } from "iconsax-react-native";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Stack,
  Text,
  VStack,
  Divider,
  Pressable
} from "native-base";
import i18next from "i18next";
import { BackHandler } from "react-native"; 
const TermsAndCondition = () => {
  const isRTL = i18next.language === "ar";
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
const navigation:any = useNavigation()
  // Define black-and-white color scheme with degrees
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF"; // Pure black/white for background
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000"; // Pure black/white for bold text
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333"; // Muted shades for content text
  const dividerColor = isDarkMode ? "#FFFFFF" : "#000000";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000"; // Icons // Pure black/white for dividers
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
  return (
    <Stack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
    >
                  <Stack w={"full"} mb={4} position={"fixed"}>
              <Pressable onPress={() => navigation.goBack()}>
                <ArrowLeft size="32" color={iconColor} />
              </Pressable>
            </Stack>
      <ScrollView paddingX={4} paddingY={6}>
        {/* Title */}
        <VStack space={4}>
          <Text
            bold
            fontSize="xl"
            color={primaryTextColor}
            textAlign={isRTL ? "right" : "left"}
          >
            {t("terms_title")}
          </Text>
          <Divider bgColor={dividerColor} />

          {/* Acceptance of Terms */}
          <VStack space={3}>
            <Text
              bold
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("acceptance_of_terms_title")}
            </Text>
            <Text
              color={secondaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("acceptance_of_terms_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* User Responsibilities */}
          <VStack space={3}>
            <Text
              bold
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("user_responsibilities_title")}
            </Text>
            <Text
              color={secondaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("user_responsibilities_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* Modifications */}
          <VStack space={3}>
            <Text
              bold
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("modifications_title")}
            </Text>
            <Text
              color={secondaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("modifications_content")}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default TermsAndCondition;