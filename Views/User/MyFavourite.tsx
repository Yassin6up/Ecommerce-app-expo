import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { removeFromFavorites } from "../../store/features/favoritesSlice";
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
  Image,
  Pressable,
} from "native-base";
import i18next from "i18next";
import { Heart, ArrowLeft } from "iconsax-react-native"; // Add ArrowLeft for back button

const MyFavourite = () => {
  const isRTL = i18next.language === "ar";
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const favorites = useSelector((state: RootState) => state.favorites.items);

  const textColor = isDarkMode ? "#E0E0E0" : "#000";
  const secondaryTextColor = isDarkMode ? "#9E9E9E" : "#616161";
  const dividerColor = "#F7CF9D";
  const cardBackground = isDarkMode ? "#2A2A2A" : "#FFFFFF";
  const cardBorderColor = isDarkMode ? "#3A3A3A" : "#E0E0E0";

  // Handle removing an item from favorites
  const handleRemoveFavorite = (id: number) => {
    dispatch(removeFromFavorites(id));
  };

  // Navigate to ProductDetails
  const handleProductPress = (item: any) => {
    navigation.navigate("page two", {
      screen: "ProductDetails",
      params: { item, id: item.id },
    });
  };

  return (
    <Stack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}>
      {/* Header */}
      <VStack paddingX={6} paddingTop={4} paddingBottom={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={4} alignItems="center">
            <Pressable onPress={() => navigation.goBack()}>
              <ArrowLeft
                size={32}
                color={isDarkMode ? "#DCAE74" : "#F7CF9D"}
              />
            </Pressable>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
              textAlign={isRTL ? "right" : "left"}>
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
        <VStack space={4} paddingX={6}>
          {favorites.length > 0 ? (
            favorites.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleProductPress(item)}
                _pressed={{ opacity: 0.8 }}>
                <Box
                  bg={cardBackground}
                  borderRadius={16} // Softer corners
                  borderWidth={1} // Subtle border
                  borderColor={cardBorderColor}
                  shadow={2} // Lighter shadow for a cleaner look
                  padding={4}>
                  <HStack space={4} alignItems="center">
                    {/* Product Image */}
                    <Image
                      source={{
                        uri: item.image
                          ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${item.image}`
                          : "https://via.placeholder.com/100",
                      }}
                      alt={item.title}
                      size="lg" // Larger image
                      borderRadius={10}
                      resizeMode="cover"
                    />

                    {/* Product Details */}
                    <VStack flex={1} justifyContent="center" space={1}>
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color={textColor}
                        textAlign={isRTL ? "right" : "left"}
                        numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text
                        fontSize="md"
                        color={dividerColor}
                        textAlign={isRTL ? "right" : "left"}>
                        ${item.price}
                      </Text>
                    </VStack>

                    {/* Remove Favorite Button */}
                    <Pressable
                      onPress={() => handleRemoveFavorite(item.id)}
                      _pressed={{ opacity: 0.7 }}>
                      <Heart size={24} color="#FF0000" variant="Bold" />
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
              paddingY={20}>
              <Text
                fontSize="lg"
                color={secondaryTextColor}
                textAlign="center">
                {t("no_favorites_yet")}
              </Text>
              <Pressable
                onPress={() => navigation.navigate("parts")}
                mt={4}>
                <Text fontSize="md" color={dividerColor}>
                  {t("explore_products")}
                </Text>
              </Pressable>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default MyFavourite;