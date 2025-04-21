import React,{useEffect} from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styles from "../Styles";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Stack,
  Text,
  VStack,
  Divider,
  Box,
  HStack,
  Pressable
} from "native-base";
import i18next from "i18next";
import { BackHandler } from "react-native"; 
import { ArrowLeft } from "iconsax-react-native";
const Policy = () => {
  const isRTL = i18next.language === "ar";
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
const navigation:any = useNavigation()
  // Define black-and-white color scheme with secondary color
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000"; // For titles and bold text
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333"; // For content text
  const dividerColor = isDarkMode ? "#FFFFFF" : "#000000";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000"; // Icons
  
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
            {t("policy_title")}
          </Text>
          <Divider bgColor={dividerColor} />

          {/* Privacy Section */}
          <VStack space={3}>
            <Text
              bold
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("privacy_policy_title")}
            </Text>
            <Text
              color={secondaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("privacy_policy_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* Terms and Conditions Section */}
          <VStack space={3}>
            <Text
              bold
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("terms_conditions_title")}
            </Text>
            <Text
              color={secondaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("terms_conditions_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* Data Usage Section */}
          <VStack space={3}>
            <Text
              bold
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("data_usage_title")}
            </Text>
            <Text
              color={secondaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("data_usage_content")}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default Policy;