import React, { Component, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import LandingPage from './Components/LandingPage';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Home from './Components/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from './Components/Services/utility';
import { apisPath } from './Utils/path';
import Loading from './Shared/Loading';


export default function App() {
  const [pageRender, setPageRender] = useState(0);
  const [signupStep, setSignupStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {


    const checkSession = async () => {
      setLoading(true);
      let session = await AsyncStorage.getItem('session')
      http.post(apisPath?.user?.checkLogin, { session: session }).then(res => {
        setLoading(false);
        setPageRender(3);
      }
      ).catch(err => {
        setLoading(false);
      })
    }
    checkSession();
  }, [])


  const currentStepHandler = (el) => {
    if (el !== -1) {
      setSignupStep(el);
      setPageRender(2);
    }
    else {
      setPageRender(3);
    }
  }

  const handlePageRender = (el) => {
    setPageRender(el);
  }

  return (
    <View style={styles.container}>
      {pageRender === 0 ? <LandingPage currentStep={currentStepHandler} pageRender={handlePageRender} />
        :
        pageRender === 1 ? <Login onStep={0} currentStep={currentStepHandler} pageRender={handlePageRender} />
          :
          pageRender === 2 ? <Signup onStep={signupStep} pageRender={handlePageRender} />
            :
            <Home pageRender={handlePageRender} />
      }
      {loading && (
        <Loading />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
