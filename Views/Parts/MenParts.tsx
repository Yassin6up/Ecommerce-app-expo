import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styles from "../Styles";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  Stack,
  Text,
  Box,
  Image,
  Button,
  VStack,
  HStack,
} from "native-base";
import { ArrowLeft } from "iconsax-react-native";
import i18next from "i18next";
import { BackHandler } from "react-native"; // Import BackHandler

// Define the product type
interface Product {
  id: number;
  title: string;
  price: number;
  old_price?: number;
  images: string | string[];
}

const MenParts = () => {
  const isRTL = i18next.language === "ar";
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  // State to store fetched products
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { categoryId, isSearch, searchText } = route.params as {
    categoryId?: number;
    isSearch?: boolean;
    searchText?: string;
  };

  // State to track if search results are empty
  const [hasSearchResults, setHasSearchResults] = useState<boolean>(true);

  // Handle hardware back button press
  useEffect(() => {
    const backAction = () => {
      navigation.navigate("parts"); // Navigate to PageTwo on back press
      return true; // Prevent default behavior (e.g., exiting the app)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setIsLoading(true);

        let response;
        if (isSearch) {
          // Fetch products by search text
          response = await axios.get(
            `https://backend.j-byu.shop/api/products/all?search=${searchText}`
          );
          const searchProducts = response.data.products || [];
          setHasSearchResults(searchProducts.length > 0); // Update search results state
          setProducts(searchProducts);
        } else {
          // Fetch products by category ID
          if (!categoryId) throw new Error("No category ID provided");
          response = await axios.get(
            `https://backend.j-byu.shop/api/products/byCatgId/${categoryId}`
          );
          setProducts(response.data);
          setHasSearchResults(true); // Reset search results state for category view
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        // Check if the error is a 404
        if (err.response && err.response.status === 404 && !isSearch) {
          setError(t("no_products_in_category")); // Custom message for 404 in category view
          setProducts([]); // Clear products to show no results
        } else {
          setError(t("error.fetch_products")); // Generic error for other cases
          setHasSearchResults(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [route.params]); // Re-fetch when route params change

  // Loading state
  if (isLoading) {
    return (
      <Stack
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}
        justifyContent="center"
        alignItems="center"
      >
        <Text color={isDarkMode ? "white" : "black"}>{t("loading")}</Text>
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Stack
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}
        justifyContent="center"
        alignItems="center"
      >
        <Text color="red.500">{error}</Text>
      </Stack>
    );
  }

  // No search results state
  if (isSearch && !hasSearchResults) {
    return (
      <Stack
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}
        justifyContent="center"
        alignItems="center"
      >
        <Text color={isDarkMode ? "white" : "black"} fontSize="lg">
          {t("no_products_found", { query: searchText })}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}
    >
      {/* Back button */}
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => navigation.navigate("PageTwo")}>
          <ArrowLeft size="32" color="#F7CF9D" />
        </Pressable>
      </Stack>

      {/* Product list */}
      <ScrollView>
        <VStack space={6} padding={4}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() =>
                navigation.navigate("ProductDetails", { id: product.id })
              }
            >
              <Box
                bg={isDarkMode ? "gray.900" : "white"}
                shadow={8}
                rounded="2xl"
                p={5}
                borderWidth={1}
                borderColor={isDarkMode ? "gray.700" : "gray.100"}
                overflow="hidden"
                position="relative"
              >
                <HStack space={4} alignItems="center">
                  {/* Product image */}
                  <Box rounded="xl" overflow="hidden" shadow={4}>
                    <Image
                      source={{
                        uri: (() => {
                          try {
                            let imageSource;
                            if (Array.isArray(product.images)) {
                              imageSource = product.images[0];
                            } else if (typeof product.images === "string") {
                              const parsedImages = JSON.parse(product.images);
                              imageSource = parsedImages[0];
                            } else {
                              imageSource = product.images;
                            }
                            return `https://backend.j-byu.shop/api/prudact/${product.id}/img/${imageSource}`;
                          } catch (error) {
                            console.error("Image URL Error:", error);
                            return null;
                          }
                        })(),
                      }}
                      alt={product.id.toString()}
                      size="xl"
                      resizeMode="cover"
                      style={{ width: 120, height: 200 }}
                      onError={(e) =>
                        console.error("Image Load Error:", e.nativeEvent.error)
                      }
                    />
                  </Box>

                  {/* Product details */}
                  <VStack flex={1} space={2}>
                    <Text
                      bold
                      fontSize={16}
                      color={isDarkMode ? "white" : "gray.900"}
                      fontFamily="body"
                      textAlign={isRTL ? "right" : "left"}
                    >
                      {product.title}
                    </Text>
                    <HStack alignItems="center" space={2}>
                      <Text
                        color={isDarkMode ? "#DCAE74" : "#468500"}
                        bold
                        fontSize="2xl"
                      >
                        {product.price} JOD
                      </Text>
                      {product.old_price && (
                        <Text color="gray.500" strikeThrough fontSize="lg">
                          {product.old_price} JOD
                        </Text>
                      )}
                    </HStack>
                    <Button
                      onPress={() =>
                        navigation.navigate("ProductDetails", {
                          product,
                          id: product.id,
                        })
                      }
                      variant="solid"
                      bgColor="#F7CF9D"
                      mt={2}
                      _hover={{
                        bg: "#F9D77E",
                        shadow: 6,
                      }}
                      _pressed={{
                        bg: "#F9D77E",
                      }}
                      rounded="full"
                      shadow={3}
                    >
                      <Text bold fontSize="md" color="white">
                        {t("Add_to_cart")}
                      </Text>
                    </Button>
                  </VStack>
                </HStack>
              </Box>
            </Pressable>
          ))}
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default MenParts;