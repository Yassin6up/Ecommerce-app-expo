import React from "react";
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
} from "native-base";
import i18next from "i18next";

const Policy = () => {
  const isRTL = i18next.language === "ar";
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const textColor = isDarkMode ? "#E0E0E0" : "#000";
  const dividerColor = "#F7CF9D";

  return (
    <Stack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
    >
      <ScrollView paddingX={4} paddingY={6}>
        {/* Title */}
        <VStack space={4}>
          <Text
            bold
            fontSize="xl"
            color={dividerColor}
            textAlign={isRTL ? "right" : "left"}
          >
            {t("policy_title")}
          </Text>
          <Divider bgColor={dividerColor} />

          {/* Privacy Section */}
          <VStack space={3}>
            <Text bold color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("privacy_policy_title")}
            </Text>
            <Text color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("privacy_policy_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* Terms and Conditions Section */}
          <VStack space={3}>
            <Text bold color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("terms_conditions_title")}
            </Text>
            <Text color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("terms_conditions_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* Data Usage Section */}
          <VStack space={3}>
            <Text bold color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("data_usage_title")}
            </Text>
            <Text color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("data_usage_content")}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default Policy;
