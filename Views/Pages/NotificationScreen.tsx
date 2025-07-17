import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store/store';
import { VStack, Box, Text, HStack, Icon, ScrollView, Pressable, useToast } from 'native-base';
import { Notification, ArrowLeft, TickCircle } from 'iconsax-react-native';
import { useTranslation } from 'react-i18next';
import { I18nManager, Animated, Easing } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const AnimatedBox = Animated.createAnimatedComponent(Box);

const NotificationScreen = () => {
  const navigation = useNavigation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const toast = useToast();

  const backgroundColor = isDarkMode ? '#121212' : '#FFFFFF';
  const cardBg = isDarkMode ? '#1E1E1E' : '#F8F8F8';
  const textColor = isDarkMode ? '#FFFFFF' : '#1A1A1A';
  const secondaryTextColor = isDarkMode ? '#A0A0A0' : '#4B4B4B';
  const accentColor = '#34C759';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Animation effect for fade-in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
        toast.show({
          title: t('Error'),
          description: t('Failed to fetch notifications'),
          duration: 3000,
        });
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
      toast.show({
        title: t('Success'),
        description: t('Notification deleted'),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.show({
        title: t('Error'),
        description: t('Failed to delete notification'),
        duration: 3000,
      });
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
      toast.show({
        title: t('Success'),
        description: t('All notifications marked as read'),
        duration: 2000,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.show({
        title: t('Error'),
        description: t('Failed to mark all as read'),
        duration: 3000,
      });
    }
  };

  return (
    <Box flex={1} bg={backgroundColor} safeArea px={4}>
      {/* Header */}
      <Box
        bg={isDarkMode ? '#1E1E1E' : '#FFFFFF'}
        px={4}
        py={5}
        borderBottomWidth={1}
        borderBottomColor={isDarkMode ? '#333333' : '#E5E5E5'}
        mb={4}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <Pressable onPress={() => navigation.goBack()} _pressed={{ opacity: 0.7 }}>
            <ArrowLeft size={28} color={textColor} variant="Bold" />
          </Pressable>
          <HStack alignItems="center" space={3}>
          
            <Text
              fontSize="xl"
              fontWeight="700"
              color={textColor}
              textAlign={isRTL ? 'right' : 'left'}
            >
              {t('Notifications')}
            </Text>
          </HStack>
          <Box w={28} /> {/* Placeholder to balance the layout */}
        </HStack>
      </Box>

      {/* Mark All as Read and Unread Count */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        px={2}
        mb={4}
        flexDirection={isRTL ? 'row-reverse' : 'row'}
      >
        <Pressable onPress={handleMarkAllRead} _pressed={{ opacity: 0.7 }}>
          <HStack alignItems="center" space={1}>
            <TickCircle size={20} color={accentColor} variant="Bold" />
            <Text color={accentColor} fontSize="sm" fontWeight="600">
              {t('Mark_all_as_read')}
            </Text>
          </HStack>
        </Pressable>
        <Text color={secondaryTextColor} fontSize="xs" fontWeight="500">
          {t('Unread')}: {unreadCount}
        </Text>
      </HStack>

      {/* Notification List */}
      <ScrollView showsVerticalScrollIndicator={false}>
       <AnimatedBox style={{ opacity: fadeAnim }}>
          <VStack space={3} pb={4}>
            {loading ? (
              <Text textAlign="center" color={secondaryTextColor} fontSize="md">
                {t('Loading...')}
              </Text>
            ) : notifications.length === 0 ? (
              <VStack alignItems="center" mt={10}>
                <Notification size={48} color={secondaryTextColor} variant="Outline" />
                <Text color={secondaryTextColor} fontSize="lg" mt={2}>
                  {t('No notifications')}
                </Text>
              </VStack>
            ) : (
              notifications.map((notif) => (
                <Pressable
                  key={notif.id}
                  onPress={() => !notif.isRead && handleMarkAllRead()}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Box
                    bg={cardBg}
                    borderRadius={16}
                    p={4}
                    shadow={2}
                    flexDirection={isRTL ? 'row-reverse' : 'row'}
                    alignItems="center"
                    borderWidth={notif.isRead ? 0 : 1}
                    borderColor={accentColor}
                  >
                    <Box mr={isRTL ? 0 : 3} ml={isRTL ? 3 : 0}>
                      <Notification
                        size={28}
                        color={notif.isRead ? secondaryTextColor : accentColor}
                        variant={notif.isRead ? 'Outline' : 'Bold'}
                      />
                    </Box>
                    <VStack flex={1} space={1}>
                      <Text
                        color={textColor}
                        fontWeight="600"
                        fontSize="md"
                        textAlign={isRTL ? 'right' : 'left'}
                      >
                        {notif.title}
                      </Text>
                      <Text
                        color={secondaryTextColor}
                        fontSize="sm"
                        textAlign={isRTL ? 'right' : 'left'}
                        numberOfLines={2}
                      >
                        {notif.message}
                      </Text>
                      <Text
                        color={secondaryTextColor}
                        fontSize="xs"
                        textAlign={isRTL ? 'right' : 'left'}
                        mt={1}
                      >
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                      </Text>
                    </VStack>
                    <Pressable onPress={() => handleDelete(notif.id)} ml={2}>
                      <Text color="#FF3B30" fontSize="sm" fontWeight="600">
                        {t('Delete')}
                      </Text>
                    </Pressable>
                  </Box>
                </Pressable>
              ))
            )}
          </VStack>
        </AnimatedBox>
      </ScrollView>
    </Box>
  );
};

export default NotificationScreen;