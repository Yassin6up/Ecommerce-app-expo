import React, { useState, useEffect } from "react";
import { Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import Swiper from "react-native-swiper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VStack, Image, Text, Pressable, Box } from "native-base";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function Adds() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t } = useTranslation();
  const navigation: any = useNavigation();
  const [sliders, setSliders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await axios.get(
          "https://backend.j-byu.shop/api/sliders/all"
        );
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

  const handleBannerPress = (link: string) => {
    // Extract product ID from link (assuming link format: "/products/7")
    const productId = link.split("/").pop();
    if (productId) {
      navigation.navigate("ProductScreen", { productId });
    }
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#F7CF9D" />
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
      justifyContent="center">
      <Animated.Text
        entering={FadeInUp.duration(800)}
        exiting={FadeOutDown.duration(600)}
        style={styles.salesText}>
        {t("Sales")}
      </Animated.Text>

      <Box
        style={{
          width: "100%",
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 5,
        }}>
        <Swiper
          loop
          autoplay
          autoplayTimeout={3}
          showsPagination
          dotStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
          activeDotStyle={{ backgroundColor: "#F7CF9D" }}
          height={250}>
          {sliders.map((slider) => (
            <Pressable
              key={slider.id}
              onPress={() => handleBannerPress(slider.link)}
              style={styles.bannerContainer}>
              <Image
                source={{
                  uri: `https://backend.j-byu.shop/api/slider/img/${slider.image}`,
                }}
                alt={slider.text}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <Box style={styles.textContainer}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  {slider.text}
                </Text>
                <Text fontSize="md" color="white">
                  {slider.description}
                </Text>
              </Box>
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
  salesText: {
    color: "#F7CF9D",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
  },
  textContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 8,
  },
});
