import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Dimensions,
  ActivityIndicator,
  Image as RNImage,
  FlatList,
  ScrollView,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchAllProducts } from "../../store/features/productsSlice";
import { fetchCategories } from "../../store/categories/categoriesSlice";
import { useTranslation } from "react-i18next";
import styles from "../Styles";
import { VStack, Text, Stack, Pressable, Box, Icon, Button, HStack, Skeleton } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { Heart } from "iconsax-react-native";
import axios from "axios";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 320;

export default function NewProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const navigation = useNavigation<any>();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const isRTL = i18n.language === "ar";

  // Category filter state
  const categories = useSelector((state: RootState) => state.categories.items);
  const categoriesLoading = useSelector((state: RootState) => state.categories.loading);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Children categories state
  const [childrenCategories, setChildrenCategories] = useState<any[]>([]);
  const [childrenLoading, setChildrenLoading] = useState<boolean>(false);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, [dispatch]);

  // Fetch children for all parent categories
  useEffect(() => {
    const fetchAllChildren = async () => {
      if (!categories || categories.length === 0) return;
      setChildrenLoading(true);
      try {
        const allChildren: any[] = [];
        for (const parent of categories) {
          const res = await axios.get(`https://backend.j-byu.shop/api/categories/children/${parent.id}`);
          if (Array.isArray(res.data)) {
            allChildren.push(...res.data);
          }
        }
        setChildrenCategories(allChildren);
      } catch (err) {
        setChildrenCategories([]);
      } finally {
        setChildrenLoading(false);
      }
    };
    fetchAllChildren();
  }, [categories]);

  // Fetch products (all or by category)
  const fetchProducts = useCallback(async (categoryId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (categoryId) {
        response = await axios.get(`https://backend.j-byu.shop/api/products/byCatgId/${categoryId}`);
        setProducts(response.data);
      } else {
        // fallback: fetch all products (random)
        response = await axios.get("https://backend.j-byu.shop/api/random-products", { params: { user_id: "1" } });
        setProducts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(t("NoProductsAvailable"));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Initial fetch (all products)
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch products when filter changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    } else {
      fetchProducts();
    }
  }, [selectedCategory, fetchProducts]);

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

  // Render filter bar (horizontal scroll, sticky)
  const renderFilterBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ backgroundColor: isDarkMode ? '#171717' : '#fff', paddingVertical: 8, paddingHorizontal: 8 }}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <Pressable onPress={() => setSelectedCategory(null)} style={{ marginRight: 12 }}>
        <Box
          px={5}
          py={2}
          rounded={20}
          bg={selectedCategory === null ? "#F7CF9D" : isDarkMode ? "#222" : "#eee"}
          borderWidth={selectedCategory === null ? 2 : 0}
          borderColor="#F7CF9D"
        >
          <Text color={selectedCategory === null ? "#000" : isDarkMode ? "#fff" : "#000"} fontWeight="bold">
            الكل
          </Text>
        </Box>
      </Pressable>
      {childrenCategories.map((cat) => (
        <Pressable key={cat.id} onPress={() => setSelectedCategory(cat.id)} style={{ marginRight: 12 }}>
          <Box
            px={5}
            py={2}
            rounded={20}
            bg={selectedCategory === cat.id ? "#F7CF9D" : isDarkMode ? "#222" : "#eee"}
            borderWidth={selectedCategory === cat.id ? 2 : 0}
            borderColor="#F7CF9D"
          >
            <Text color={selectedCategory === cat.id ? "#000" : isDarkMode ? "#fff" : "#000"} fontWeight="bold">
              {cat.name}
            </Text>
          </Box>
        </Pressable>
      ))}
    </ScrollView>
  );

  // Render product card
  const renderProduct = ({ item }: { item: any }) => {
    let images: string[] = [];
    try {
      images = JSON.parse(item.images);
    } catch (error) {
      // ignore
    }
    const imageUrl = images.length
      ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${images[0]}`
      : "https://via.placeholder.com/300";
    return (
      <Box
        bg={isDarkMode ? "#1a1a1a" : "#fff"}
        rounded={20}
        shadow={4}
        overflow="hidden"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        alignSelf="center"
        mb={6}
      >
        <Pressable onPress={() => handlePress(item)}>
          <RNImage
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: 180, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            resizeMode="contain"
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
              lineHeight={25}
            >
              {item.title}
            </Text>
            {/* Product description */}
            
            <Text color={isDarkMode ? "#fff" : "#468500"} fontSize={18} fontWeight="bold">
              {item.price} JOD
            </Text>
          </VStack>
          <Button
            size="md"
            borderRadius={25}
            px={8}
            py={3}
            bg="#F7CF9D"
            _text={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}
            shadow={3}
            onPress={() => handleAddToCart(item)}
            _pressed={{ opacity: 0.8 }}
          >
            {t('Add_to_cart')}
          </Button>
        </VStack>
      </Box>
    );
  };

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

  // Shimmer loading for categories (only on first load)
  if (categoriesLoading || childrenLoading) {
    return (
      <View
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}
      >
        <VStack
          w={"full"}
          alignItems={"center"}
          justifyContent={"center"}
          mb={4}
        >
          <Text
            style={[
              isDarkMode ? styles.darkText : styles.lightText,
              {
                fontSize: 24,
                marginBottom: 8,
                textAlign: isRTL ? "right" : "left",
                lineHeight: 50,
              },
            ]}
          >
            <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>{t("New")}</Text> {t("Products")}
          </Text>
          <Stack width={"15%"} h={2} bg="#F7CF9D" rounded={4}></Stack>
        </VStack>
        {renderFilterBar()}
        <Box px={4} py={6}>
          <HStack space={4} justifyContent="center">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h={CARD_HEIGHT} w={CARD_WIDTH} rounded={20} startColor={isDarkMode ? "#222" : "#eee"} endColor={isDarkMode ? "#444" : "#ccc"} />
            ))}
          </HStack>
        </Box>
      </View>
    );
  }

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
        mb={4}
      >
        <Text
          style={[
            isDarkMode ? styles.darkText : styles.lightText,
            {
              fontSize: 24,
              marginBottom: 8,
              textAlign: isRTL ? "right" : "left",
              lineHeight: 50,
            },
          ]}
        >
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>{t("New")}</Text> {t("Products")}
        </Text>
        <Stack width={"15%"} h={2} bg="#F7CF9D" rounded={4}></Stack>
      </VStack>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={renderFilterBar}
        stickyHeaderIndices={[0]}
        ListEmptyComponent={loading ? (
          <Box px={4} py={6}>
            <HStack space={4} justifyContent="center">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={CARD_HEIGHT} w={CARD_WIDTH} rounded={20} startColor={isDarkMode ? "#222" : "#eee"} endColor={isDarkMode ? "#444" : "#ccc"} />
              ))}
            </HStack>
          </Box>
        ) : error ? (
          <Text style={{ textAlign: "center", color: isDarkMode ? "#fff" : "#000" }}>
            {error}
          </Text>
        ) : null}
        scrollEnabled={true}
      />
    </View>
  );
}