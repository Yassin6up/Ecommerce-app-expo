import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  BackHandler,
  Alert,
  ScrollView,
  Dimensions, // <-- Add this import
} from "react-native";
import { StackActions, useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import {
  addToFavorites,
  removeFromFavorites,
} from "../../store/features/favoritesSlice";
import { useTranslation } from "react-i18next";
import { RootState } from "../../store/store";
import {
  VStack,
  Text,
  Image,
  HStack,
  Button,
  Box,
  useToast,
} from "native-base";
import Swiper from "react-native-swiper";
import { ArrowLeft, Heart } from "iconsax-react-native";
import i18next from "i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setPassHome } from "../../store/PassHomeSlice";
import { RouteProp } from '@react-navigation/native';

const { width: deviceWidth } = Dimensions.get("window");
const imageHeight = deviceWidth * 0.75; // 4:3 ratio for better visibility

const ProductDetails = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const toast = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [scaleValue] = useState(new Animated.Value(1));
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isFavorite, setFave] = useState(false);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isRTL = i18next.language === "ar";

  // Dynamic theme colors
  const backgroundColor = isDarkMode ? "#1A1A1A" : "#FFFFFF";
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000";
  const secondaryTextColor = isDarkMode ? "#B0B0B0" : "#4A4A4A";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      (navigation as any).navigate("parts");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = route.params;
        let userId = await AsyncStorage.getItem("userId");
        if (!userId) userId = "0";

        const response = await axios.get(
          `https://backend.j-byu.shop/api/products/${id}`,
          { params: { user_id: userId } }
        );

        const productData = {
          ...response.data,
          images: JSON.parse(response.data.images),
        };
        setFave(response.data.isSaved);
        setProduct(productData);
      } catch (err: any) {
        setError(t("product_fetch_error"));
        console.error("Product fetch error:", err?.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (route.params?.id) {
      fetchProduct();
    }
  }, [route.params?.id, t]);

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!product) return;

    const hasColors = product.colors && JSON.parse(product.colors)?.length > 0;
    const hasSizes = product.sizes && JSON.parse(product.sizes)?.length > 0;

    let missingSelections = [];
    if (hasColors && !selectedColor) missingSelections.push(t("color"));
    if (hasSizes && !selectedSize) missingSelections.push(t("size"));

    if (missingSelections.length > 0) {
      toast.show({
        placement: "top",
        render: () => (
          <Box
            bg="red.500"
            px="4"
            py="2"
            rounded="md"
            _text={{ color: "#FFFFFF", fontWeight: "bold" }}
          >
            {t("please_select")} {missingSelections.join(" & ")}
          </Box>
        ),
      });
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.images[0],
        quantity: 1,
        vendorWhatsApp: product.vendorWhatsApp,
        vendorPhoneNumber: product.vendorPhoneNumber,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      })
    );

    toast.show({
      placement: "top",
      render: () => (
        <Box
          bg="green.500"
          px="4"
          py="2"
          rounded="md"
          _text={{ color: "#FFFFFF", fontWeight: "bold" }}
        >
          {t("product_added_to_cart")}
        </Box>
      ),
    });
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      Alert.alert(
        t("please_login_title"),
        t("please_login_message"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("login"),
            onPress: () => {
              dispatch(setPassHome(false));
            },
          },
        ],
        { cancelable: true }
      );
      return;
    }

    if (!product) return;

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setFave(!isFavorite);

    try {
      const response = await axios.post(
        "https://backend.j-byu.shop/api/toggle-saved-product",
        {
          user_id: userId,
          product_id: product.id,
        }
      );

      if (response.status === 201) {
        dispatch(addToFavorites({ productId: product.id }));
      } else {
        dispatch(removeFromFavorites({ productId: product.id }));
      }
    } catch (error: any) {
      setFave(isFavorite);
      console.error("Toggle favorite error:", error.response?.data);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor, justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color={primaryTextColor} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          {error || t("product_not_found")}
        </Text>
      </View>
    );
  }

  return (
    <VStack style={[styles.container, { backgroundColor }]}>
      {/* Header with Back Button */}
      <HStack
        w="full"
        p={4}
        alignItems="center"
        justifyContent="space-between"
        style={styles.header}
      >
        <Pressable onPress={() => (navigation as any).navigate("parts")}>
          <ArrowLeft size={32} color={iconColor} />
        </Pressable>
        <Pressable onPress={handleToggleFavorite}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Heart
              size={32}
              color={iconColor}
              variant={isFavorite ? "Bold" : "Outline"}
              style={styles.favoriteIcon}
            />
          </Animated.View>
        </Pressable>
      </HStack>

      {/* Swiper for Product Images */}
      <View style={{ width: deviceWidth, height: imageHeight, alignSelf: 'center' }}>
        <Swiper
          style={{ height: imageHeight }}
          showsPagination
          paginationStyle={styles.pagination}
          dotStyle={[styles.dot, { backgroundColor: isDarkMode ? "#666" : "#CCC" }]}
          activeDotStyle={[styles.activeDot, { backgroundColor: "#34C759" }]}
          loop
        >
          {product.images.map((img: string, idx: number) => (
            <View key={idx} style={{ width: deviceWidth, height: imageHeight, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{
                  uri: `https://backend.j-byu.shop/api/prudact/${product.id}/img/${img}`,
                }}
                style={{ width: deviceWidth, height: imageHeight }}
                resizeMode="contain"
                alt={`${product.title}-${idx}`}
              />
            </View>
          ))}
        </Swiper>
      </View>

      {/* Product Information */}
      <ScrollView style={{ flex: 1, paddingBottom: 80, marginBottom: 80 }}>
        <VStack px={4} py={8} space={4}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={primaryTextColor}
          textAlign={isRTL ? "right" : "left"}
        >
          {product.title}
        </Text>

        <Text
          fontSize="2xl"
          fontWeight="bold"
          color={primaryTextColor}
          textAlign={isRTL ? "right" : "left"}
        >
          {product.price} JOD
        </Text>

        <Text
          fontSize="md"
          color={secondaryTextColor}
          textAlign={isRTL ? "right" : "left"}
        >
          {product.description}
        </Text>

        {/* Color Selection */}
        {product.colors && JSON.parse(product.colors)?.length > 0 && (
          <VStack space={2}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("Select_Color")}
            </Text>
            <HStack space={3} flexWrap="wrap">
              {JSON.parse(product.colors)?.map((color: string) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                />
              ))}
            </HStack>
          </VStack>
        )}

        {/* Size Selection */}
        {product.sizes && JSON.parse(product.sizes)?.length > 0 && (
          <VStack space={2}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("Select_Size")}
            </Text>
            <HStack space={3} flexWrap="wrap">
              {JSON.parse(product.sizes)?.map((size: string) => (
                <Pressable
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor: isDarkMode ? "#333" : "#F5F5F5",
                      borderColor: selectedSize === size ? "#34C759" : iconColor,
                    },
                    selectedSize === size && styles.selectedSize,
                  ]}
                >
                  <Text
                    color={primaryTextColor}
                    fontWeight={selectedSize === size ? "bold" : "normal"}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        )}
      </VStack>
      </ScrollView>
    

      {/* Fixed Add to Cart Button */}
      <View style={styles.fixedButtonContainer}>
        <Button
          onPress={handleAddToCart}
          backgroundColor={buttonBgColor}
          _text={{ color: buttonTextColor, fontWeight: "bold", fontSize: "md" }}
          style={styles.addToCartButton}
          _pressed={{ opacity: 0.8 }}
        >
          {t("Add_to_cart")}
        </Button>
      </View>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  favoriteIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  swiper: {
    // No fixed height here, handled inline
    marginTop: 60,
  },
  slide: {
    // No flex or height here, handled inline
  },
  image: {
    // No fixed width/height here, handled inline
    borderRadius: 12,
  },
  pagination: {
    bottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedColor: {
    borderColor: "#34C759",
    borderWidth: 3,
  },
  sizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedSize: {
    borderColor: "#34C759",
    borderWidth: 3,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "transparent",
  },
  addToCartButton: {
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default ProductDetails;