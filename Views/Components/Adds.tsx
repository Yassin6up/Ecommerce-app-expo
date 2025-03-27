import React, { useState, useEffect, useCallback } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VStack, Image, Text, Pressable, Box } from "native-base";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import logo from "../../assets/logo.png"; // Ensure this path is correct
import axios from "axios";

const { width } = Dimensions.get("window");

export default function Adds() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();
  const navigation: any = useNavigation();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await axios.get("https://backend.j-byu.shop/api/sliders/all");
        setSliders(response.data);
      } catch (err) {
        setError("Failed to load sliders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  const handleBannerPress = useCallback(
    (item: any) => {
      if (item.link && item.link !== "null" && typeof item.link === "string") {
        const productIdMatch = item.link.match(/\/products\/(\d+)/);
        const productId = productIdMatch ? productIdMatch[1] : null;

        if (productId) {
          navigation.navigate("page two", {
            screen: "ProductDetails",
            params: { item, id: productId },
          });
        } else {
          console.log("No valid product ID found in link:", item.link);
        }
      } else {
        console.log("No valid link for slider:", item.id);
      }
    },
    [navigation]
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor={'black'}>
        <Image
          source={logo}
          alt="App Logo"
          width={100} // Adjust size as needed
          height={100} // Adjust size as needed
          resizeMode="contain"
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <VStack
      style={[
        styles.container,
        isDarkMode ? styles.darkBackground : styles.lightBackground,
      ]}
      space={4}
      alignItems="center"
      justifyContent="center"
    >
      <VStack
        w={"full"}
        alignItems={"center"}
        justifyContent={"center"}
        mb={8}
      >
        <Text
          style={[
            isDarkMode ? styles.darkText : styles.lightText,
            { fontSize: 20 },
          ]}
        >
          {t("Sales")}
        </Text>
      </VStack>
      <Box style={styles.swiperContainer}>
        <Swiper
          loop
          autoplay
          autoplayTimeout={3}
          showsPagination
          dotStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
          activeDotStyle={{ backgroundColor: "#F7CF9D" }}
          width={width}
          height={250}
        >
          {sliders.map((slider: any) => (
            <Pressable
              key={slider.id}
              onPress={() => handleBannerPress(slider)}
              style={styles.bannerContainer}
            >
              <Image
                source={{
                  uri: `https://backend.j-byu.shop/api/slider/img/${slider.image}`,
                }}
                alt={slider.text}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </Swiper>
      </Box>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  lightBackground: {
    backgroundColor: "#f9f9f9",
  },
  swiperContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    width: width,
  },
  bannerImage: {
    width: width,
    height: 250,
    borderRadius: 16,
  },
  lightText: {
    color: "black",
  },
  darkText: {
    color: "white",
  },
});