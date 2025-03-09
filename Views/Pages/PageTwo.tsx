import { View, Text, VStack, HStack, ScrollView, Pressable } from "native-base";
import React, { useEffect, useState } from "react";
import axios from "axios"; // Make sure to install axios
import styles from "../Styles";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { useTranslation } from "react-i18next";
import { fetchCategories } from "../../store/categories/categoriesSlice";
import { ArrowLeft, ArrowDown2, ArrowUp2 } from "iconsax-react-native";
import { useNavigation } from "@react-navigation/native";

// Define an interface for category structure
interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
}

const PageTwo = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const categories = useSelector((state: RootState) => state.categories.items);
  const loading = useSelector((state: RootState) => state.categories.loading);

  // State to manage expanded categories and their children
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [childCategories, setChildCategories] = useState<{
    [key: string]: Category[];
  }>({});
  const [loadingChildren, setLoadingChildren] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    dispatch(fetchCategories())
      .unwrap()
      .then((data) => console.log("Fetched categories:", data))
      .catch((error) => console.log("Error fetching categories:", error));
  }, [dispatch]);

  // Function to fetch children categories for a specific parent
  const fetchChildCategories = async (categoryId: string) => {
    // Prevent multiple simultaneous loading
    if (loadingChildren[categoryId]) return;

    try {
      // Set loading state for this category
      setLoadingChildren((prev) => ({
        ...prev,
        [categoryId]: true,
      }));

      // Fetch child categories
      const response = await axios.get(
        `https://backend.j-byu.shop/api/categories/children/${categoryId}`
      );

      // Update child categories state
      setChildCategories((prev) => ({
        ...prev,
        [categoryId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching child categories:", error);
    } finally {
      // Reset loading state
      setLoadingChildren((prev) => ({
        ...prev,
        [categoryId]: false,
      }));
    }
  };

  // Toggle function to expand/collapse categories with children
  const toggleCategory = (category: Category) => {
    const categoryId = category.id;

    // Toggle expanded state
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    // If expanding and no children loaded yet, fetch them
    if (
      !expandedCategories[categoryId] &&
      (!childCategories[categoryId] || childCategories[categoryId].length === 0)
    ) {
      fetchChildCategories(categoryId);
    }
  };

  return (
    <ScrollView
      style={[
        styles.mainContainer,
        isDarkMode ? styles.darkBckground : styles.lightBckground,
      ]}>
      <VStack space={4} py={8}>
        {/* Loading State */}
        {loading && <Text textAlign="center">Loading categories...</Text>}

        {/* API Categories */}
        {!loading &&
          categories.length > 0 &&
          categories.map((category) => (
            <View key={category.id}>
              <Pressable onPress={() => toggleCategory(category)}>
                <HStack
                  w={"full"}
                  px={4}
                  py={2}
                  rounded={4}
                  bgColor={"#171717"}
                  alignItems={"center"}
                  justifyContent={"space-between"}>
                  <ArrowLeft size="24" color="#fff" variant="Bold" />
                  <Text fontWeight={"bold"} fontSize={16} color={'white'}>
                    {category.name}
                  </Text>

                  {/* Show dropdown icon only if category has children */}
                  {category.children?.length > 0 &&
                    (expandedCategories[category.id] ? (
                      <ArrowUp2 size="24" color="#000" />
                    ) : (
                      <ArrowDown2 size="24" color="#000" />
                    ))}
                </HStack>
              </Pressable>

              {/* Render child categories if expanded */}
              {expandedCategories[category.id] && (
                <View>
                  {loadingChildren[category.id] ? (
                    <Text textAlign="center" py={2}>
                      Loading children...
                    </Text>
                  ) : (
                    childCategories[category.id]?.map((child: Category) => (
                      <Pressable
                        onPress={() =>
                          navigation.navigate("page two", {
                            screen: "men",
                            params: { categoryId: child.id },
                          })
                        }>
                        <HStack
                          key={child.id}
                          w={"full"}
                          px={8} // Indent child category
                          py={2}
                          rounded={4}
                          my={2}
                          bgColor={"#212121"}
                          alignItems={"center"}
                          justifyContent={"space-between"}>
                          <ArrowLeft size="20" color="#fff" variant="Bold" />
                          <Text fontWeight={"bold"} fontSize={14} color={'white'}>
                            {child.name}
                          </Text>
                        </HStack>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>
          ))}
      </VStack>
    </ScrollView>
  );
};

export default PageTwo;
