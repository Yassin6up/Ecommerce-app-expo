import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VStack, Box, Text, HStack, Icon, ScrollView } from "native-base";
import { Notification, TickCircle, InfoCircle } from "iconsax-react-native";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

const NotificationScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar" || I18nManager.isRTL;

  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const cardBg = isDarkMode ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

  // Example notifications
  const notifications = [
    {
      icon: <Notification size={28} color="#4F8EF7" variant="Bold" />, // blue
      title: t("notification_order_shipped"),
      message: t("notification_order_shipped_msg"),
      time: t("notification_time_2h"),
    },
    {
      icon: <TickCircle size={28} color="#22C55E" variant="Bold" />, // green
      title: t("notification_payment_successful"),
      message: t("notification_payment_successful_msg"),
      time: t("notification_time_today"),
    },
    {
      icon: <InfoCircle size={28} color="#F59E42" variant="Bold" />, // orange
      title: t("notification_new_offer"),
      message: t("notification_new_offer_msg"),
      time: t("notification_time_now"),
    },
  ];

  return (
    <Box flex={1} bg={backgroundColor} safeArea px={4}>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        color={textColor}
        mt={4}
        mb={6}
        textAlign={isRTL ? "right" : "left"}
      >
        {t("Notifications", "Notifications")}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={4}>
          {notifications.map((notif, idx) => (
            <Box
              key={idx}
              bg={cardBg}
              borderRadius={12}
              p={4}
              shadow={2}
              flexDirection={isRTL ? "row-reverse" : "row"}
              alignItems="center"
            >
              <Box mr={isRTL ? 0 : 4} ml={isRTL ? 4 : 0}>{notif.icon}</Box>
              <VStack flex={1} space={1}>
                <Text color={textColor} fontWeight="bold" fontSize="md" textAlign={isRTL ? "right" : "left"}>
                  {notif.title}
                </Text>
                <Text color={secondaryTextColor} fontSize="sm" textAlign={isRTL ? "right" : "left"}>
                  {notif.message}
                </Text>
                <Text color={secondaryTextColor} fontSize="xs" textAlign={isRTL ? "right" : "left"} mt={1}>
                  {notif.time}
                </Text>
              </VStack>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default NotificationScreen; 