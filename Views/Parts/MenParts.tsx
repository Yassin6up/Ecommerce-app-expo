import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
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

// Define the product type
interface Product {
  id: number;
  nameKey: string;
  image: string | number;
  new_price: number;
  old_price?: number;
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
  const { categoryId, isSearch, searchText } = route.params;

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setError(null);

        // Get category ID from route params
        if (!categoryId) {
          throw new Error("No category ID provided");
        }

        // Make API call
        const response = await axios.get(
          `https://backend.j-byu.shop/api/products/byCatgId/${categoryId}`
        );

        // Set products from API response
        setProducts(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("لم يتم العتور على منتجات");
        setIsLoading(false);
      }
    };

    const fetchProductsByTitle = async () => {
      try {
        setError(null);

        // Make API call
        const response = await axios.get(
          `https://backend.j-byu.shop/api/products/all?search=${searchText}`
        );

        // Set products from API response
        setProducts(response.data.products);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("لم يتم العتور على منتجات");
        setIsLoading(false);
      }
    };

    if (isSearch) {
      fetchProductsByTitle();
    } else {
      fetchProductsByCategory();
    }
  }, [route.params]);

  // Loading state
  if (isLoading) {
    return (
      <Stack
        style={[
          styles.mainContainer,
          isDarkMode ? styles.darkBckground : styles.lightBckground,
        ]}>
        <Text>{t("Loading")}</Text>
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
        ]}>
        <Text color="red.500">{error}</Text>
      </Stack>
    );
  }

  return (
    <Stack
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}>
      <Stack w={"full"} mb={4} position={"fixed"}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size="32" color="#F7CF9D" />
        </Pressable>
      </Stack>
      <ScrollView>
        <VStack space={6} padding={4}>
          {products?.map((product) => {
            return (
              <Pressable
                key={product.id}
                onPress={() =>
                  navigation.navigate("ProductDetails", { id: product.id })
                }>
                <Box
                  bg={isDarkMode ? "gray.900" : "white"}
                  shadow={8}
                  rounded="2xl"
                  p={5}
                  borderWidth={1}
                  borderColor={isDarkMode ? "gray.700" : "gray.100"}
                  overflow="hidden"
                  position="relative">
                  <HStack space={4} alignItems="center">
                    <Box rounded="xl" overflow="hidden" shadow={4}>
                      <Image
                        source={{
                          uri: (() => {
                            try {
                              // Handle different potential image formats
                              let imageSource;

                              // If images is already an array
                              if (Array.isArray(product.images)) {
                                imageSource = product.images[0];
                              }
                              // If images is a JSON string
                              else if (typeof product.images === "string") {
                                const parsedImages = JSON.parse(product.images);
                                imageSource = parsedImages[0];
                              }
                              // If images is a single string
                              else if (typeof product.images === "string") {
                                imageSource = product.images;
                              }

                              // Construct full URL
                              const imageUrl = `https://backend.j-byu.shop/api/prudact/${product.id}/img/${imageSource}`;

                              return imageUrl;
                            } catch (error) {
                              console.error("Image URL Error:", error);
                              // Fallback image or null
                              return null;
                            }
                          })(),
                        }}
                        alt={product.id.toString()}
                        size="xl"
                        resizeMode="cover"
                        style={{ width: 120, height: 200 }}
                        onError={(e) =>
                          console.error(
                            "Image Load Error:",
                            e.nativeEvent.error
                          )
                        }
                      />
                    </Box>

                    <VStack flex={1} space={2}>
                      <Text
                        bold
                        fontSize={16}
                        color={isDarkMode ? "white" : "gray.900"}
                        fontFamily="body"
                        textAlign={isRTL ? "right" : "left"}>
                        {product.title}
                      </Text>
                      <HStack alignItems="center" space={2}>
                        <Text
                          color={isDarkMode ? "#DCAE74" : "#468500"}
                          bold
                          fontSize="2xl">
                          ${product.price}
                        </Text>
                        {product.old_price && (
                          <Text color="gray.500" strikeThrough fontSize="lg">
                            ${product.old_price}
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
                        shadow={3}>
                        <Text bold fontSize="md" color="white">
                          {t("Add_to_cart")}
                        </Text>
                      </Button>
                    </VStack>
                  </HStack>
                </Box>
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>
    </Stack>
  );
};

export default MenParts;
