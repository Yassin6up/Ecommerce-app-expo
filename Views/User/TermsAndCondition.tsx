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
} from "native-base";
import i18next from "i18next";

const TermsAndCondition = () => {
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
            {t("terms_title")}
          </Text>
          <Divider bgColor={dividerColor} />

          {/* Acceptance of Terms */}
          <VStack space={3}>
            <Text bold color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("acceptance_of_terms_title")}
            </Text>
            <Text color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("acceptance_of_terms_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* User Responsibilities */}
          <VStack space={3}>
            <Text bold color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("user_responsibilities_title")}
            </Text>
            <Text color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("user_responsibilities_content")}
            </Text>
          </VStack>

          <Divider bgColor={dividerColor} />

          {/* Modifications */}
          <VStack space={3}>
            <Text bold color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("modifications_title")}
            </Text>
            <Text color={textColor} textAlign={isRTL ? "right" : "left"}>
              {t("modifications_content")}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default TermsAndCondition;
