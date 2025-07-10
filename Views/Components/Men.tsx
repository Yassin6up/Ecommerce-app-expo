import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import styles from "../Styles";
import { HStack, VStack, Text, Image, Pressable, Box, Icon, Button } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { Heart } from "iconsax-react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_SPACING = 12;
const CARD_HEIGHT = 250;

export default function Men() {
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const navigation = useNavigation<any>();
  const [menProducts, setMenProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const isRTL = i18n.language === "ar";
  const MEN_CATEGORY_ID = 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://backend.j-byu.shop/api/products/byCatgId/${MEN_CATEGORY_ID}`
        );
        const products = response.data.slice(0, 5).map((product: any) => ({
          ...product,
          images: JSON.parse(product.images),
        }));
        setMenProducts(products);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setMenProducts([]);
          return;
        }
        setError("Failed to fetch products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (error) {
    return (
      <View style={[styles.mainContainer, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}> 
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.images?.length
      ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${item.images[0]}`
      : "https://via.placeholder.com/300";
    // For demo, random rating
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    return (
      <Box
        bg={isDarkMode ? "#181818" : "#fff"}
        rounded={16}
        shadow={6}
        overflow="hidden"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        mr={CARD_SPACING}
        alignItems="center"
        justifyContent="flex-start"
      >
        <Pressable onPress={() => handlePress(item)}>
          <Image
            source={{ uri: imageUrl }}
            alt={item.title}
            style={{ width: "100%", height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            resizeMode="cover"
            onError={(e) => console.log(`Image load error for ${item.id}:`, e.nativeEvent.error)}
          />
        </Pressable>
        <VStack px={4} py={3} space={2} w="100%">
          <HStack alignItems="center" justifyContent="space-between">
            <Text
              color={isDarkMode ? "#fff" : "#000"}
              fontSize={15}
              fontWeight="bold"
              numberOfLines={2}
              flex={1}
              textAlign={isRTL ? "right" : "left"}
            >
              {item.title}
            </Text>
            <Pressable onPress={() => handleFavorite(item.id)}>
              <Icon as={Heart} size={6} color={favoriteIds.includes(item.id) ? "#F7CF9D" : isDarkMode ? "#fff" : "#000"} variant={favoriteIds.includes(item.id) ? "Bold" : "Linear"} />
            </Pressable>
          </HStack>
          <HStack alignItems="center" space={1} mt={1}>
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                as={require('react-native-vector-icons/FontAwesome').default}
                name="star"
                size={4}
                color={i < rating ? "#F7CF9D" : isDarkMode ? "#333" : "#ccc"}
              />
            ))}
          </HStack>
          <Text color={isDarkMode ? "#fff" : "#000"} fontSize={16} fontWeight="bold">
            {item.price} JOD
          </Text>
          <Button
            mt={2}
            size="sm"
            borderRadius={20}
            px={6}
            bg="#F7CF9D"
            _text={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}
            shadow={2}
            onPress={() => handleAddToCart(item)}
          >
            {t('Add_to_cart')}
          </Button>
        </VStack>
      </Box>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: isDarkMode ? "#000" : "#fff" }]}> 
      <HStack
        w={"full"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={isRTL ? 'row-reverse' : 'row'}
        my={4}
      >
        <Text color={isDarkMode ? "#fff" : "#000"} fontSize={20} fontWeight="bold">
          <Text color={isDarkMode ? "#fff" : "#000"}>{t("New")}</Text>
        </Text>
        <Pressable
          px={4}
          py={2}
          rounded={20}
          bgColor="#F7CF9D"
          alignSelf="stretch"
          onPress={() =>
            navigation.navigate("page two", {
              screen: "men",
              params: { categoryId: 1 },
            })
          }
          _pressed={{ opacity: 0.7 }}
        >
          <HStack alignItems={"center"} justifyContent={"center"}>
            <Text color="#000" fontSize={13} fontWeight="bold">
              {t("show_all")}
            </Text>
          </HStack>
        </Pressable>
      </HStack>
      <FlatList
        data={menProducts}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: CARD_SPACING / 2 }}
        renderItem={renderItem}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
}