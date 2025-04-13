import React , {useEffect , useState} from 'react';
import AuthPages from './Auth/Index';
import Pages from '.';
import { RootState } from '../store/store';
import { useSelector , useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setPassHome } from "../store/PassHomeSlice";

export default function AppScreens() {
  // useSelector must be called inside the component
  const passHome = useSelector((state: RootState) => state.passHome.value);
  const dispatch = useDispatch()
  const  [pass,setCheckPass] = useState(null)
  async function checkPassToken(){
    const token  = await AsyncStorage.getItem('sessionToken');
    setCheckPass(token)
    if(token){
      dispatch(setPassHome(true))
    }
  }

useEffect(()=>{
  checkPassToken()
},[passHome])




  return (
 passHome ? <Pages /> : <AuthPages />
  );
  
}