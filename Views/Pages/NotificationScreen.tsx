import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VStack, Box, Text, HStack, Icon, ScrollView } from "native-base";
import { Notification, TickCircle, InfoCircle } from "iconsax-react-native";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

// Notification type for API data
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  userId: number;
  productId?: number;
  createdAt: string;
  isRead: boolean;
}

const NotificationScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar" || I18nManager.isRTL;

  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const cardBg = isDarkMode ? "#1A1A1A" : "#F5F5F5";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications and unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const notifRes = await axios.get(`https://backend.j-byu.shop/api/user/${userId}`);
        setNotifications(notifRes.data.notifications || []);
        const unreadRes = await axios.get(`https://backend.j-byu.shop/api/user/${userId}/unread-count`);
        setUnreadCount(unreadRes.data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Delete notification by id
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://backend.j-byu.shop/api/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      await axios.patch(`https://backend.j-byu.shop/api/user/${userId}/mark-all-read`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Box flex={1} bg={backgroundColor} safeArea px={0}>
      {/* Stylish Header */}
      <Box
        bg={isDarkMode ? '#222' : '#F7CF9D'}
        px={4}
        py={5}
        borderBottomLeftRadius={24}
        borderBottomRightRadius={24}
        shadow={3}
        mb={6}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center" space={3}>
            <Icon as={Notification} size={8} color={isDarkMode ? '#F7CF9D' : '#222'} variant="Bold" />
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={isDarkMode ? '#fff' : '#222'}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("Notifications", "Notifications")}
            </Text>
          </HStack>
          <VStack alignItems="flex-end" space={1}>
            <Text color="#34C759" fontSize="md" fontWeight="bold" onPress={handleMarkAllRead}>
              {t('Mark_all_as_read')}
            </Text>
            <Text color={isDarkMode ? '#fff' : '#222'} fontSize="sm">
              {t('Unread')}: {unreadCount}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={4}>
          {loading ? (
            <Text textAlign={'center'} color={secondaryTextColor}>{t('Loading...')}</Text>
          ) : notifications.length === 0 ? (
            <Text textAlign={'center'} color={secondaryTextColor}>{t('No notifications')}</Text>
          ) : notifications.map((notif) => (
            <Box
              key={notif.id}
              bg={cardBg}
              borderRadius={12}
              p={4}
              shadow={2}
              flexDirection={isRTL ? "row-reverse" : "row"}
              alignItems="center"
              opacity={notif.isRead ? 0.5 : 1}
            >
              <Box mr={isRTL ? 0 : 4} ml={isRTL ? 4 : 0}>
                <Notification size={28} color="#34C759" variant="Bold" />
              </Box>
              <VStack flex={1} space={1}>
                <Text color={textColor} fontWeight="bold" fontSize="md" textAlign={isRTL ? "right" : "left"}>
                  {notif.title}
                </Text>
                <Text color={secondaryTextColor} fontSize="sm" textAlign={isRTL ? "right" : "left"}>
                  {notif.message}
                </Text>
                <Text color={secondaryTextColor} fontSize="xs" textAlign={isRTL ? "right" : "left"} mt={1}>
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                </Text>
              </VStack>
              <Text color="#F00" fontSize="sm" ml={2} onPress={() => handleDelete(notif.id)}>
                {t('Delete')}
              </Text>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default NotificationScreen; 