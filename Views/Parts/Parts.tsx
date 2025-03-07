import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MenParts from "./MenParts";
import PageTwo from "../Pages/PageTwo";
import ProductDetails from "./ProductDetails";
const Stack = createNativeStackNavigator();

const Parts: React.FC<any> = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen
        name="parts"
        component={PageTwo}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="men"
        component={MenParts}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default Parts;
