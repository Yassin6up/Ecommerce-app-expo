import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import styles from "../Styles";
import { HStack, VStack, Text, Image, Pressable } from "native-base";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_SPACING = 12;

export default function Men() {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const navigation = useNavigation<any>();
  const [menProducts, setMenProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setMenProducts([]); // Handle 404 gracefully
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

  // Memoize navigation handler
  const handlePress = useCallback(
    (item: any) => {
      navigation.navigate("page two", {
        screen: "ProductDetails",
        params: { item, id: item.id },
      });
    },
    [navigation]
  );

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#F7CF9D" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.mainContainer}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.images?.length
      ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${item.images[0]}`
      : "https://via.placeholder.com/300";

    return (
      <Pressable
        onPress={() => handlePress(item)}
        style={{
          width: CARD_WIDTH,
          marginRight: CARD_SPACING,
          alignItems: "center",
           alignSelf:"stretch"
        }}
        _pressed={{ opacity: 0.7 }} // Visual feedback
      >
        <Image
          source={{ uri: imageUrl }}
          alt={item.title}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
          resizeMode="cover"
          onError={(e) => console.log(`Image load error for ${item.id}:`, e.nativeEvent.error)}
        />
        <HStack
          w={"90%"}
          alignItems={"center"}
          justifyContent={"space-between"}
          mt={5}>
          <Text
            style={isDarkMode ? styles.darkText : styles.lightText}
            w={"70%"}
            numberOfLines={2}>
            {item.title}
          </Text>
          <VStack>
            <Text
              style={{ color: isDarkMode ? "#FFCC8B" : "black" }}
              fontSize={18}>
              ${item.price}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}>
      <HStack
        w={"full"}
        alignItems={"center"}
        justifyContent={"space-between"}
        my={4}>
        <Text
          style={[
            isDarkMode ? styles.darkText : styles.lightText,
            { fontSize: 20 },
          ]}>
          <Text style={{ color: "#F7CF9D" }}>{t("New")}</Text> {/* Assuming "تقنية" was a placeholder */}
        </Text>
        <Pressable
          px={4}
          py={2}
          rounded={4}
          bgColor={"#F9D77E"}
           alignSelf="stretch"
          onPress={() =>
            navigation.navigate("page two", {
              screen: "men",
              params: { categoryId: 1 },
            })
          }
          _pressed={{ opacity: 0.7 }}>
          <HStack alignItems={"center"} justifyContent={"space-between"}>
            <Text fontSize={12}>{t("show_all")}</Text>
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
        initialNumToRender={3} // Render fewer items initially
        maxToRenderPerBatch={5} // Control batch rendering
        windowSize={5} // Limit virtualized items
      />
    </View>
  );
}