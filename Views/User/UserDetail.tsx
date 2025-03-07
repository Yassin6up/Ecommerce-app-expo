import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profil from "./Profil";
import Orders from "./Orders";
import TermsAndCondition from "./TermsAndCondition";
import Policy from "./Policy";
import PageFour from "../Pages/PageFour";
const Stack = createNativeStackNavigator();

const UserDetail: React.FC<any> = () => {
  return (
    <Stack.Navigator >
      <Stack.Screen
        name="UserPage"
        component={PageFour}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profil"
        component={Profil}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TermsAndCondition"
        component={TermsAndCondition}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Policy"
        component={Policy}
        options={{
          headerShown: false,
        }}
      />
   
    
    </Stack.Navigator>
  );
};

export default UserDetail;
