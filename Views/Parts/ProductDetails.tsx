import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
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


const ProductDetails = () => {
  const navigation: any = useNavigation();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scaleValue] = useState(new Animated.Value(1));
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // State for selected color
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // State for selected size
  const [isFavorite , setFave] = useState(false)
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const userId = useSelector((state: RootState) => state.auth?.user?.id);
  const isRTL = i18next.language === "ar";


  // Static arrays for colors and sizes (since no backend yet)
  const colors = ["#FF0000", "#0000FF", "#00FF00", "#FFA500"]; // Red, Blue, Green, Orange
  const sizes = ["S", "M", "L", "XL"];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = route.params;
        const userId = await AsyncStorage.getItem("userId");
        
        const response = await axios.get(
          `https://backend.j-byu.shop/api/products/${id}`,
          { params: { user_id: userId } }
        );

        const productData = {
          ...response.data,
          images: JSON.parse(response.data.images),
        };
        setFave(response.data.isSaved)

        setProduct(productData);
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
        image: product.images[0],
        quantity: 1,
        vendorWhatsApp: product.vendorWhatsApp,
        vendorPhoneNumber: product.vendorPhoneNumber,
        color: selectedColor || undefined, // Include selected color
        size: selectedSize || undefined, // Include selected size
      })
    );
  };

const handleToggleFavorite = async () => {
  if (!product) return;
  const userId = await AsyncStorage.getItem("userId");

  // Animation sequence
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

  // Update UI state immediately for better user experience
  setFave(!isFavorite);

  // Make API call to toggle favorite status
  try {
    const response = await axios.post(
      "https://backend.j-byu.shop/api/toggle-saved-product",
      {
        user_id: userId, // Make sure userId is defined or passed as parameter
        product_id: product.id, // Assuming product.id exists
      }
    );

    // Handle the response based on the status
    if (response.status === 201) {
      console.log("Product saved successfully:", response.data);
    } else {
      console.log("Product removed from saved list:", response.data);
    }
  } catch (error) {
    // Handle error and potentially revert UI state
    setFave(isFavorite); // Revert back if API call fails
    
    if (error.response) {
      // The server responded with a status other than 2xx
      console.error("Error response:", error.response.data);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Error setting up request:", error.message);
    }
  }
};

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#F7CF9D" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.mainContainer}>
        <Text style={{ color: "red" }}>{error || t("product_not_found")}</Text>
      </View>
    );
  }

  return (
    <VStack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}>
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => navigation.navigate("parts")}>
          <ArrowLeft size="32" color={isDarkMode ? "#DCAE74" : "#F7CF9D"} />
        </Pressable>
      </Stack>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <HStack
          width={"full"}
          justifyContent={"space-between"}
          alignItems={"center"}>
          <Image
            source={{
              uri: `https://backend.j-byu.shop/api/prudact/${product.id}/img/${product.images[0]}`,
            }}
            width={250}
            height={310}
            rounded={4}
            resizeMode="cover"
            alt={product.title}
          />
          <VStack space={2}>
            {product.images.slice(0, 3).map((img: string, idx: number) => (
              <Image
                key={idx}
                source={{
                  uri: `https://backend.j-byu.shop/api/prudact/${product.id}/img/${img}`,
                }}
                width={100}
                height={100}
                rounded={4}
                resizeMode="cover"
                alt={`${product.title}-${idx}`}
              />
            ))}
          </VStack>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize={28}
            marginTop={2}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
            textAlign={isRTL ? "right" : "left"}>
            {product.title}
          </Text>
          <Animated.View
            style={[
              customStyles.favoriteButton,
              { transform: [{ scale: scaleValue }] },
            ]}>
            <Pressable onPress={handleToggleFavorite}>
              <Heart
                size="28"
                color={isFavorite ? "#FF0000" : isDarkMode ? "#DCAE74" : "#F7CF9D"}
                variant={isFavorite ? "Bold" : "Outline"}
              />
            </Pressable>
          </Animated.View>
        </HStack>

        <Text
          color={isDarkMode ? "#DCAE74" : "#468500"}
          bold
          fontSize="2xl"
          textAlign={isRTL ? "right" : "left"}>
          ${product.price}
        </Text>

        <Text
          color={isDarkMode ? "#FFFFFF" : "#000000"}
          textAlign={isRTL ? "right" : "left"}>
          {product.description}
        </Text>

        {/* Color Selection */}
{
  JSON.parse(product.colors) && (

    <VStack mt={4} space={2}>
    <Text
      fontSize="lg"
      fontWeight="bold"
      color={isDarkMode ? "#FFFFFF" : "#000000"}
      textAlign={isRTL ? "right" : "left"}>
      {t("Select_Color")}
    </Text>
    <HStack space={3}>
      {JSON.parse(product.colors)?.map((color) => (
        <Pressable
          key={color}
          onPress={() => setSelectedColor(color)}
          style={[
            customStyles.colorButton,
            { backgroundColor: color },
            selectedColor === color && customStyles.selectedColorButton,
          ]}
        />
      ))}
    </HStack>
  </VStack>

  )
}

        {/* Size Selection */}

        {JSON.parse(product.sizes) && (
          <VStack mt={4} space={2}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={isDarkMode ? "#FFFFFF" : "#000000"}
            textAlign={isRTL ? "right" : "left"}>
            {t("Select_Size")}
          </Text>
          <HStack space={3}>
            {JSON.parse(product.sizes)?.map((size) => (
              <Pressable
                key={size}
                onPress={() => setSelectedSize(size)}
                style={[
                  customStyles.sizeButton,
                  {
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#F9D77E",
                    borderColor:
                      selectedSize === size
                        ? "#468500"
                        : isDarkMode
                        ? "#DCAE74"
                        : "#FFCC8B",
                  },
                ]}>
                <Text
                  color={isDarkMode ? "#FFFFFF" : "#000000"}
                  fontWeight={selectedSize === size ? "bold" : "normal"}>
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
          backgroundColor="#FFCC8B"
          _text={{ color: isDarkMode ? "#000000" : "#FFFFFF" }}>
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    borderColor: "#FFFFFF", // White border for contrast
  },
  selectedColorButton: {
    borderColor: "#468500", // Green border for selected color
    borderWidth: 3,
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