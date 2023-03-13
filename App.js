import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import LandingPage from './Components/LandingPage';
import Home from './Components/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from './Components/Services/utility';
import { apisPath } from './Utils/path';
import Loading from './Shared/Loading';


export default function App() {
  const [loading, setLoading] = useState(false);
  const [onStep, setOnStep] = useState(0)
  const [landingPage, setLandingPage] = useState(true)

  useEffect(() => {
    checkSession();
  }, [landingPage])


  const checkSession = async () => {
    setLoading(true);
    let session = await AsyncStorage.getItem('session');
    console.log(session)
    http.post(apisPath?.user?.checkLogin, { session: session }).then(res => {
      setLoading(false);
      if (res?.data?.onStep === 4) {
        setLandingPage(true);
        setOnStep(res?.data?.onStep)
      }
      else {
        setOnStep(0);
        setLandingPage(false);
      }
    }
    ).catch(err => {
      setLandingPage(true)
      setLoading(false);
    })
  }
  const landingPageHandler = (el) => {
    setLandingPage(el);
  }

  return (
    <View style={styles.container} >
      {landingPage ?
        <LandingPage landingPageHandler={landingPageHandler} onStep={onStep} />
        :
        <Home landingPageHandler={landingPageHandler} />
      }
      {loading && (
        <Loading />
      )}
    </View>
  );
}
const styles = StyleSheet.create({

  container: {
    top: 0,
    left: 0,
    flex: 1,
    backgroundColor: '#fff',
  },
});
