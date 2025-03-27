import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styles from "../Styles";
import { useTranslation } from "react-i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackHandler } from "react-native"; 
import {
  ScrollView,
  Stack,
  Text,
  VStack,
  Divider,
  Box,
  HStack,
  Image,
  Pressable,
  Spinner,
  Center,
} from "native-base";
import i18next from "i18next";
import { Heart, ArrowLeft } from "iconsax-react-native";

const MyFavourite = () => {
  const isRTL = i18next.language === "ar";
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  // Define black-and-white color scheme
  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000"; // Titles, bold text, icons
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333"; // Muted text (size, color, no favorites)
  const cardBackground = isDarkMode ? "#1A1A1A" : "#F5F5F5"; // Slightly off for card contrast
  const cardBorderColor = isDarkMode ? "#FFFFFF" : "#000000";
  const dividerColor = isDarkMode ? "#FFFFFF" : "#000000";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

  useEffect(() => {
    fetchFavorites();
  }, []);
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
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      
      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `https://backend.j-byu.shop/api/saved-products/${userId}`
      );
      console.log(response.data.savedProducts);
      setFavorites(response.data.savedProducts || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (id: number) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      
      if (!userId) {
        console.error("User ID not found");
        return;
      }
      
      setFavorites(favorites.filter(item => item.id !== id));
      
      await axios.post("https://backend.j-byu.shop/api/toggle-saved-product", {
        user_id: userId,
        product_id: id
      });
      
      fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
      fetchFavorites();
    }
  };

  const handleProductPress = (item: any) => {
    navigation.navigate("page two", {
      screen: "ProductDetails",
      params: { item, id: item.id },
    });
  };

  return (
    <Stack
      style={[styles.mainContainer, { backgroundColor: backgroundColor }]}
    >
      {/* Header */}
      <VStack paddingX={6} paddingTop={4} paddingBottom={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={4} alignItems="center">
            <Pressable onPress={() => navigation.goBack()}>
              <ArrowLeft size={32} color={iconColor} />
            </Pressable>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("my_favorites")}
            </Text>
          </HStack>
          <Text fontSize="md" color={secondaryTextColor}>
            {favorites.length} {t("items")}
          </Text>
        </HStack>
        <Divider bgColor={dividerColor} mt={2} thickness={1} />
      </VStack>

      {/* Favorites List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {loading ? (
          <Center flex={1} paddingY={20}>
            <Spinner size="lg" color={primaryTextColor} />
          </Center>
        ) : (
          <VStack space={4} paddingX={6}>
            {favorites.length > 0 ? (
              favorites.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleProductPress(item)}
                  _pressed={{ opacity: 0.8 }}
                >
                  <Box
                    bg={cardBackground}
                    borderRadius={16}
                    borderWidth={1}
                    borderColor={cardBorderColor}
                    shadow={2}
                    padding={4}
                  >
                    <HStack space={4} alignItems="center">
                      {/* Product Image */}
                      <Image
                        source={{
                          uri: item.images
                            ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${JSON.parse(item.images)[0]}`
                            : "https://via.placeholder.com/100",
                        }}
                        alt={item.title}
                        size="lg"
                        borderRadius={10}
                        resizeMode="cover"
                      />

                      {/* Product Details */}
                      <VStack flex={1} justifyContent="center" space={1}>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color={primaryTextColor}
                          textAlign={isRTL ? "right" : "left"}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          fontSize="md"
                          color={primaryTextColor}
                          textAlign={isRTL ? "right" : "left"}
                        >
                          ${item.price}
                        </Text>
                        {item.size && (
                          <Text
                            fontSize="sm"
                            color={secondaryTextColor}
                            textAlign={isRTL ? "right" : "left"}
                          >
                            {t("size")}: {item.size}
                          </Text>
                        )}
                        {item.color && (
                          <Text
                            fontSize="sm"
                            color={secondaryTextColor}
                            textAlign={isRTL ? "right" : "left"}
                          >
                            {t("color")}: {item.color}
                          </Text>
                        )}
                      </VStack>

                      {/* Remove Favorite Button */}
                      <Pressable
                        onPress={() => handleRemoveFavorite(item.id)}
                        _pressed={{ opacity: 0.7 }}
                      >
                        <Heart size={24} color={iconColor} variant="Bold" />
                      </Pressable>
                    </HStack>
                  </Box>
                </Pressable>
              ))
            ) : (
              <VStack
                flex={1}
                justifyContent="center"
                alignItems="center"
                paddingY={20}
              >
                <Text
                  fontSize="lg"
                  color={secondaryTextColor}
                  textAlign="center"
                >
                  {t("no_favorites_yet")}
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("page two")}
                  mt={4}
                >
                  <Text fontSize="md" color={primaryTextColor}>
                    {t("explore_products")}
                  </Text>
                </Pressable>
              </VStack>
            )}
          </VStack>
        )}
      </ScrollView>
    </Stack>
  );
};

export default MyFavourite;