import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Dimensions,
  ActivityIndicator,
  Image as RNImage,
  Animated,
} from "react-native";
import Swiper from "react-native-swiper";
import NetInfo from "@react-native-community/netinfo";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchAllProducts } from "../../store/features/productsSlice";
import { useTranslation } from "react-i18next";
import styles from "../Styles";
import { VStack, Text, Stack, Pressable, Box, Icon, Button, HStack, Skeleton } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { Heart } from "iconsax-react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width *0.9;
const CARD_HEIGHT = 320;

export default function NewProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { products: productsData, status } = useSelector(
    (state: any) => state.products
  );
  const navigation = useNavigation<any>();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    dispatch(fetchAllProducts());
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handlePress = useCallback(
    (item: any) => {
      navigation.navigate("page two", {
        screen: "ProductDetails",
        params: { item, id: item.id },
      });
    },
    [navigation]
  );

  const handleFavorite = (id: number) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (item: any) => {
    // Implement add to cart logic here
    // e.g., dispatch(addToCart(item));
  };

  const displayedProducts = Array.isArray(productsData) ? productsData : [];

  if (!isConnected) {
    return (
      <View
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}>
        <VStack
          w={"full"}
          alignItems={"center"}
          justifyContent={"center"}
          mt={50}>
          <Text style={{ color: isDarkMode ? "#fff" : "#000", fontSize: 18 }}>
            {t("No Connection")}
          </Text>
        </VStack>
      </View>
    );
  }

  // Shimmer loading
  if (status === "loading") {
    return (
      <Box px={4} py={6}>
        <HStack space={4} justifyContent="center">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h={CARD_HEIGHT} w={CARD_WIDTH} rounded={20} startColor={isDarkMode ? "#222" : "#eee"} endColor={isDarkMode ? "#444" : "#ccc"} />
          ))}
        </HStack>
      </Box>
    );
  }

  const renderSwiperItem = (item: any, index: number) => {
    let images: string[] = [];
    try {
      images = JSON.parse(item.images);
    } catch (error) {
      console.error(`Error parsing images for product ${item.id}:`, error);
    }
    const imageUrl = images.length
      ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${images[0]}`
      : "https://via.placeholder.com/300";

    // Remove scale and opacity effects to reduce lag
    const isActive = activeIndex === index;

    return (
      <View
        key={item.id}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "stretch",
        }}
      >
        <Box
          bg={isDarkMode ? "#1a1a1a" : "#fff"}
          rounded={20}
          shadow={isActive ? 12 : 4}
          overflow="hidden"
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          borderWidth={isActive ? 2 : 0}
          borderColor="#F7CF9D"
        >
          <Pressable onPress={() => handlePress(item)}>
            <RNImage
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: 180, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              resizeMode="contain"
              onError={(e) => console.log(`Image load error for ${item.id}:`, e.nativeEvent.error)}
            />
            {/* Favorite button overlay */}
            <Pressable 
              onPress={() => handleFavorite(item.id)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Icon 
                as={Heart} 
                size={6} 
                color={favoriteIds.includes(item.id) ? "#F7CF9D" : "#fff"} 
                variant={favoriteIds.includes(item.id) ? "Bold" : "Linear"} 
              />
            </Pressable>
          </Pressable>
          <VStack px={5} py={4} space={3} flex={1} justifyContent="space-between">
            <VStack space={2}>
              <Text
                color={isDarkMode ? "#fff" : "#000"}
                fontSize={16}
                fontWeight="bold"
                numberOfLines={2}
                textAlign={isRTL ? "right" : "left"}
                lineHeight={20}
              >
                {item.title}
              </Text>
              <Text color={isDarkMode ? "#fff" : "#000"} fontSize={18} fontWeight="bold">
                {item.price} JOD
              </Text>
            </VStack>
            <Button
              size="md"
              borderRadius={25}
              px={8}
              py={3}
              bg="#F7CF9D"
              _text={{ color: '#000', fontWeight: 'bold', fontSize: 15 }}
              shadow={3}
              onPress={() => handleAddToCart(item)}
              _pressed={{ opacity: 0.8 }}
            >
              {t('Add_to_cart')}
            </Button>
          </VStack>
        </Box>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}>
      <VStack
        w={"full"}
        alignItems={"center"}
        justifyContent={"center"}
        mb={12}>
        <Text
          style={[
            isDarkMode ? styles.darkText : styles.lightText,
            {
              fontSize: 24,
              marginBottom: 16,
              textAlign: isRTL ? "right" : "left",
         lineHeight:50
            },
          ]}>
          <Text style={{color: isDarkMode ? "#fff" : "#000" }}>{t("New")}</Text> {t("Products")}
        </Text>
        <Stack width={"15%"} h={2} bg="#F7CF9D" rounded={4}></Stack>
      </VStack>
      {displayedProducts.length > 0 ? (
        <VStack space={6}>
          <Swiper
            showsButtons={false}
  
            autoplayTimeout={4}
            horizontal={true}
            loop={true}
            containerStyle={{
              height: CARD_HEIGHT + 40,
              width: "100%",
            }}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dot={
              <View
                style={{
                  backgroundColor: isDarkMode ? "#333" : "#ccc",
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 6,
                  marginVertical: 3,
                }}
              />
            }
            activeDot={
              <View
                style={{
                  backgroundColor: "#F7CF9D",
                  width: 30,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 6,
                  marginVertical: 3,
                }}
              />
            }
            loadMinimal
            loadMinimalSize={3}
            index={activeIndex}
            onIndexChanged={setActiveIndex}
            scrollEnabled={true}
            showsPagination={true}
            removeClippedSubviews={false}
          >
            {displayedProducts.map((item, idx) => renderSwiperItem(item, idx))}
          </Swiper>
        </VStack>
      ) : (
        <Text
          style={{ textAlign: "center", color: isDarkMode ? "#fff" : "#000" }}>
          {t("NoProductsAvailable")}
        </Text>
      )}
    </View>
  );
}