import React from "react";
import { View, Dimensions } from "react-native";
import styles from "../Styles";
import Men from "../Components/Men";
 import NewProducts from "../Components/NewProducts";
 import Women from "../Components/Women";
 import Kids from "../Components/Kids";
import { ScrollView } from "native-base";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Adds from "../Components/Adds";

const PageOne = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return (
    <ScrollView style={[
      styles.viewContainer,
      isDarkMode ? styles.darkBckground : styles.lightBckground,
    ]} flex={1} height={'100%'} >
      <Adds />
      <NewProducts />
      {/* <Men  /> */}
      {/* <Kids  /> */}
   
    </ScrollView>
  );
};

export default PageOne;
