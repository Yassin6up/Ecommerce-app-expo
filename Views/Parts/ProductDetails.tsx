import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  BackHandler,
  Alert, // For login prompt
} from "react-native";
import { useRoute } from "@react-navigation/native";
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
  ScrollView,
  Button,
  Stack,
} from "native-base";
import styles from "../Styles";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Heart } from "iconsax-react-native";
import i18next from "i18next";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setPassHome } from "../../store/PassHomeSlice";

const ProductDetails = () => {
  const navigation:any = useNavigation();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scaleValue] = useState(new Animated.Value(1));
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isFavorite, setFave] = useState(false);
  const [mainImage, setMainImage] = useState<string>("");
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isRTL = i18next.language === "ar";

  const backgroundColor = isDarkMode ? "#000000" : "#FFFFFF";
  const primaryTextColor = isDarkMode ? "#FFFFFF" : "#000000";
  const secondaryTextColor = isDarkMode ? "#CCCCCC" : "#333333";
  const buttonBgColor = isDarkMode ? "#FFFFFF" : "#000000";
  const buttonTextColor = isDarkMode ? "#000000" : "#FFFFFF";
  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      navigation.navigate("parts");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = route.params;
        let userId = await AsyncStorage.getItem("userId");

        // Use userId = "0" for non-logged-in users
        if (!userId) {
          userId = "0";
        }

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
        setMainImage(productData.images[0]);
      } catch (err: any) {
        setError(t("product_fetch_error"));
        console.error("Product fetch error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (route.params?.id) {
      fetchProduct();
    }
  }, [route.params?.id, t]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: mainImage,
        quantity: 1,
        vendorWhatsApp: product.vendorWhatsApp,
        vendorPhoneNumber: product.vendorPhoneNumber,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      })
    );
  };

  const handleToggleFavorite = async () => {
    const userId = await AsyncStorage.getItem("userId");

    // Check if user is logged in
    if (!userId) {
      Alert.alert(
        t("please_login_title"),
        t("please_login_message"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("login"),
            onPress: () => {
              // Navigate to Login screen in AuthPages
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
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
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
      setFave(isFavorite); // Revert on failure
      console.error("Toggle favorite error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 405) {
        console.error("Method not allowed - try GET if POST is unsupported");
      }
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.mainContainer, { justifyContent: "center", backgroundColor }]}
      >
        <ActivityIndicator size="large" color={primaryTextColor} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.mainContainer, { backgroundColor }]}>
        <Text style={{ color: "red" }}>{error || t("product_not_found")}</Text>
      </View>
    );
  }

  const handleImageSelect = (image: string) => {
    setMainImage(image);
  };

  return (
    <VStack style={[styles.mainContainer, { backgroundColor }]}>
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => navigation.navigate("parts")}>
          <ArrowLeft size="32" color={iconColor} />
        </Pressable>
      </Stack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <HStack
          width={"full"}
          justifyContent={"space-between"}
          alignItems={"center"}
          space={2}
        >
          <Image
            source={{
              uri: `https://backend.j-byu.shop/api/prudact/${product.id}/img/${mainImage}`,
            }}
            width={250}
            height={310}
            rounded={4}
            resizeMode="cover"
            alt={product.title}
          />
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            height={300}
          >
            <VStack space={12}>
              {product.images.map((img: string, idx: number) => (
                <Pressable key={idx} onPress={() => handleImageSelect(img)}>
                  <Image
                    source={{
                      uri: `https://backend.j-byu.shop/api/prudact/${product.id}/img/${img}`,
                    }}
                    width={120}
                    height={120}
                    rounded={4}
                    resizeMode="cover"
                    alt={`${product.title}-${idx}`}
                    borderWidth={mainImage === img ? 3 : 0}
                    borderColor={mainImage === img ? "green" : "transparent"}
                  />
                </Pressable>
              ))}
            </VStack>
          </ScrollView>
        </HStack>
        <Stack width={"full"} alignItems={"center"} justifyContent={"center"}>
          <Animated.View
            style={[
              customStyles.favoriteButton,
              { backgroundColor: isDarkMode ? "#1A1A1A" : "#F5F5F5" },
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <Pressable onPress={handleToggleFavorite}>
              <Heart
                size="28"
                color={iconColor}
                variant={isFavorite ? "Bold" : "Outline"}
              />
            </Pressable>
          </Animated.View>
        </Stack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize={18}
            marginTop={2}
            color={primaryTextColor}
            textAlign={isRTL ? "right" : "left"}
          >
            {product.title}
          </Text>
        </HStack>

        <Text
          color={primaryTextColor}
          bold
          fontSize="2xl"
          textAlign={isRTL ? "right" : "left"}
        >
          {product.price} JOD
        </Text>

        <Text
          color={secondaryTextColor}
          textAlign={isRTL ? "right" : "left"}
          marginTop={8}
        >
          {product.description}
        </Text>

        {/* Color Selection */}
        {JSON.parse(product.colors) && (
          <VStack mt={4} space={2}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("Select_Color")}
            </Text>
            <HStack space={3}>
              {JSON.parse(product.colors)?.map((color: string) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    customStyles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && {
                      borderColor: "green",
                      borderWidth: 3,
                    },
                  ]}
                />
              ))}
            </HStack>
          </VStack>
        )}

        {/* Size Selection */}
        {JSON.parse(product.sizes) && (
          <VStack mt={4} space={2}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={primaryTextColor}
              textAlign={isRTL ? "right" : "left"}
            >
              {t("Select_Size")}
            </Text>
            <HStack space={3}>
              {JSON.parse(product.sizes)?.map((size: string) => (
                <Pressable
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    customStyles.sizeButton,
                    {
                      backgroundColor: isDarkMode ? "#1A1A1A" : "#F5F5F5",
                      borderColor: selectedSize === size ? "green" : iconColor,
                    },
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
      </ScrollView>

      <View style={button.fixedButtonContainer}>
        <Button
          onPress={handleAddToCart}
          backgroundColor={buttonBgColor}
          _text={{ color: buttonTextColor }}
        >
          {t("Add_to_cart")}
        </Button>
      </View>
    </VStack>
  );
};

const button = StyleSheet.create({
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
});

const customStyles = StyleSheet.create({
  favoriteButton: {
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  sizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductDetails;