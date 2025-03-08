import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/cartSlice";
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
import { ArrowLeft } from "iconsax-react-native";
import i18next from "i18next";
import axios from "axios";

const ProductDetails = () => {
  const navigation: any = useNavigation();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const userId = useSelector((state: RootState) => state.auth?.user?.id); // Assuming you have auth state
  const isRTL = i18next.language === "ar";

  console.log(route.params);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(userId);
        const { id } = route.params;
        const response = await axios.get(
          `https://backend.j-byu.shop/api/products/${id}`,
          { params: { user_id: 1 } }
        );

        const productData = {
          ...response.data,
          images: JSON.parse(response.data.images), // Parse images array
        };

        setProduct(productData);
      } catch (err) {
        setError(t("product_fetch_error"));
        console.error("Product fetch error:", err.response.data);
      } finally {
        setLoading(false);
      }
    };

    if (route.params?.id) {
      fetchProduct();
    }
  }, [route.params?.id]);

  const handleAddToCart = () => {
    if (!product) return;

    // if (selectedSize && selectedColor) {
    dispatch(
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.images[0],
        quantity: 1,
        // size: selectedSize,
        // color: selectedColor,
        vendorWhatsApp: product.vendorWhatsApp,
        vendorPhoneNumber: product.vendorPhoneNumber,
      })
    );
    // } else {
    //   alert(t("Please_select_size_and_color"));
    // }
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

        <Text
          fontSize={28}
          marginTop={2}
          color={isDarkMode ? "#FFFFFF" : "#000000"}
          textAlign={isRTL ? "right" : "left"}>
          {product.title}
        </Text>

        <Text
          color={isDarkMode ? "#DCAE74" : "#468500"}
          bold
          fontSize="2xl"
          textAlign={isRTL ? "right" : "left"} >
          ${product.price}
        </Text>

        <Text color={isDarkMode ? "#FFFFFF" : "#000000"}    textAlign={isRTL ? "right" : "left"}>
          {product.description} 
        </Text>

        {/* Vendor Information */}
        {/* <VStack mt={4} space={2}>
          <Text bold color={isDarkMode ? "#FFFFFF" : "#000000"}>
            {t("vendor_info")}
          </Text>
          <Text color={isDarkMode ? "#FFFFFF" : "#000000"}>
            WhatsApp: {product.vendorWhatsApp}
          </Text>
          <Text color={isDarkMode ? "#FFFFFF" : "#000000"}>
            {t("phone")}: {product.vendorPhoneNumber}
          </Text>
        </VStack> */}

        {/* Size Selection */}
        {/* <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>
          {t("Select_Size")}
        </Text> */}
        {/* <View style={{ flexDirection: "row", marginVertical: 10 }}>
          {["XL", "L", "M", "S"].map((size) => (
            <Pressable
              key={size}
              onPress={() => setSelectedSize(size)}
              style={[
                styles.sizeButton,
                {
                  borderColor: selectedSize === size ? "#468500" : isDarkMode ? "#DCAE74" : "#FFCC8B",
                  backgroundColor: isDarkMode ? "#2A2A2A" : "#F9D77E"
                }
              ]}
            >
              <Text color={isDarkMode ? "#FFFFFF" : "#000000"}>{size}</Text>
            </Pressable>
          ))}
        </View> */}

        {/* Color Selection */}
        {/* <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>
          {t("Select_Color")}
        </Text>
        <View style={{ flexDirection: "row", marginVertical: 10 }}>
          {["#FF0000", "#0000FF", "#008000", "#808080"].map((color) => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorButton,
                {
                  backgroundColor: color,
                  borderColor: selectedColor === color ? (isDarkMode ? "#DCAE74" : "#F7CF9D") : "transparent"
                }
              ]}
            />
          ))}
        </View> */}
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

// const styles = StyleSheet.create({
//   sectionTitle: {
//     marginTop: 10,
//     fontWeight: "bold",
//     color: "#000000",
//   },
//   sizeButton: {
//     padding: 10,
//     margin: 5,
//     borderWidth: 2,
//     borderRadius: 5,
//   },
//   colorButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 4,
//     margin: 5,
//   },
// });

const button = StyleSheet.create({
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
});

export default ProductDetails;
