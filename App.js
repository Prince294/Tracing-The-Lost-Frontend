import React, { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import LandingPage from "./Components/LandingPage";
import Home from "./Components/Home";
import AsyncStorage from "@react-native-async-storage/async-storage";
import http from "./Components/Services/utility";
import { apisPath } from "./Utils/path";
import Loading from "./Shared/Loading";
import { StatusBar } from "react-native";
import * as Updates from 'expo-updates';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [onStep, setOnStep] = useState(0);
  const [landingPage, setLandingPage] = useState(true);

  useEffect(() => {
    checkForUpdates();
    checkSession();
  }, [landingPage]);

  const checkForUpdates = async () => {
    try {
      const { isAvailable } = await Updates.checkForUpdateAsync();
      if (isAvailable) {
        Alert.alert(
          "Update Available",
          "Please Update your app to lastest Version",
          [
            {
              text: "Ok",
              onPress: async () => {
                await Updates.fetchUpdateAsync();
              },
            },
          ]
        );
        Alert.alert(
          "Update Complete",
          "Please Restart Your App!",
          [
            {
              text: "Ok",
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      }
    } catch (error) {
    }
  }

  const checkSession = async () => {
    var session;
    setLoading(true);
    try {
      session = await AsyncStorage.getItem("session");
    } catch (e) {
      setLandingPage(true);
      setLoading(false);
    }
    console.log(session);
    if (session) {
      http
        .post(apisPath?.user?.checkLogin, { session: session })
        .then((res) => {
          setLoading(false);
          if (res?.data?.on_step >= 2) {
            setLandingPage(true);
            setOnStep(res?.data?.on_step);
          } else {
            setOnStep(0);
            setLandingPage(false);
          }
        })
        .catch((err) => {
          setLandingPage(true);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };
  const landingPageHandler = (el) => {
    setLandingPage(el);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      {landingPage ? (
        <LandingPage landingPageHandler={landingPageHandler} onStep={onStep} />
      ) : (
        <Home landingPageHandler={landingPageHandler} />
      )}
      {loading && <Loading />}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    flex: 1,
    backgroundColor: "#fff",
  },
});
