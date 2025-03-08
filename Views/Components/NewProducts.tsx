import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Dimensions,
  ActivityIndicator,
  Image as RNImage,
} from "react-native";
import Swiper from "react-native-swiper";
import NetInfo from "@react-native-community/netinfo";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchAllProducts } from "../../store/features/productsSlice";
import { useTranslation } from "react-i18next";
import styles from "../Styles";
import { VStack, Text, Stack, Pressable } from "native-base";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;

export default function NewProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { products: productsData, status } = useSelector(
    (state: any) => state.products
  );
  const navigation = useNavigation<any>();
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    dispatch(fetchAllProducts());
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, [dispatch]);

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

  if (status === "loading") {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#F7CF9D" />
      </View>
    );
  }

  const renderSwiperItem = (item: any) => {
    let images: string[] = [];
    try {
      images = JSON.parse(item.images);
    } catch (error) {
      console.error(`Error parsing images for product ${item.id}:`, error);
    }
    const imageUrl = images.length
      ? `https://backend.j-byu.shop/api/prudact/${item.id}/img/${images[0]}`
      : "https://via.placeholder.com/300";

    return (
      <Pressable
        onPress={() => handlePress(item)}
        key={item.id}
        style={{
          width: CARD_WIDTH,
          alignItems: "center",
          justifyContent: "center",
           alignSelf:"stretch"
        }}
        _pressed={{ opacity: 0.7 }} // Visual feedback
      >
        <RNImage
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: 200, borderRadius: 10 }}
          resizeMode="cover"
          onError={(e) => console.log(`Image load error for ${item.id}:`, e.nativeEvent.error)}
        />
        <Text
          style={{
            color: isDarkMode ? "#fff" : "#000",
            fontSize: 16,
            textAlign: "center",
            marginTop: 8,
          }}>
          {item.title}
        </Text>
        <Text
          style={{
            color: "#F7CF9D",
            fontSize: 16,
            textAlign: "center",
            marginTop: 4,
          }}>
          ${item.price}
        </Text>
      </Pressable>
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
              fontSize: 20,
              marginBottom: 16,
              textAlign: i18n.language === "ar" ? "right" : "left",
            },
          ]}>
          <Text style={{ color: "#F7CF9D" }}>{t("New")}</Text> {t("Products")}
        </Text>
        <Stack width={"20%"} h={1.5} bg={"#F7CF9D"} rounded={4}></Stack>
      </VStack>

      {displayedProducts.length > 0 ? (
        <Swiper
          showsButtons={false}
          autoplay={true}
          horizontal={true}
          loop={true}
          containerStyle={{
            height: 300,
            width: "100%",
          }}
          dot={
            <View
              style={{
                backgroundColor: "#ccc",
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
              }}
            />
          }
          activeDot={
            <View
              style={{
                backgroundColor: "#F7CF9D",
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
              }}
            />
          }
          loadMinimal // Optimize Swiper rendering
          loadMinimalSize={3} // Preload only a few items
        >
          {displayedProducts.map((item) => renderSwiperItem(item))}
        </Swiper>
      ) : (
        <Text
          style={{ textAlign: "center", color: isDarkMode ? "#fff" : "#000" }}>
          {t("NoProductsAvailable")}
        </Text>
      )}
    </View>
  );
}