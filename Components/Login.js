import React, { Component, useEffect, useRef, useState } from "react";
import { Stack, TextInput, IconButton } from "@react-native-material/core";
import {
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  View,
  BackHandler,
  Keyboard,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import { apisPath } from "../Utils/path";
import http from "./Services/utility";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../Shared/Loading";
import Error from "../Shared/Error";
import { ImageBackground } from "react-native";
import { Text } from "react-native";

const { height, width } = Dimensions.get("window");
export default function Login(props) {
  const textInput0 = useRef();
  const textInput1 = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [usernameEmail, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validData, setValidData] = useState(true);
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to go back?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        { text: "YES", onPress: () => props?.mainScreen() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (
      usernameEmail?.length > 2 &&
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,24}$/.test(password)
    ) {
      setValidData(true);
    } else {
      setValidData(false);
    }
  }, [password, usernameEmail]);

  const handleFormSubmit = () => {
    setLoading(true);
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(usernameEmail)) {
      http
        .post(apisPath?.user?.userLogin, {
          password: password,
          email: usernameEmail,
        })
        .then((res) => {
          setLoading(false);
          AsyncStorage.setItem("session", res?.data?.session_id);
          props?.currentStep(res?.data?.data?.on_step);
        })
        .catch((err) => {
          setLoading(false);
          setError(true);
          setErrMessage(err?.response?.data?.message);
        });
    } else {
      http
        .post(apisPath?.user?.userLogin, {
          password: password,
          username: usernameEmail,
        })
        .then((res) => {
          setLoading(false);
          AsyncStorage.setItem("session", res?.data?.session_id);
          props?.currentStep(res?.data?.data?.on_step);
        })
        .catch((err) => {
          setLoading(false);
          setError(true);
          setErrMessage(err?.response?.data?.message);
        });
    }
  };

  const handleErrorClick = () => {
    setError(false);
  };

  return (
    <>
      <Stack spacing={0} style={{ flex: 1, flexDirection: "column" }}>
        <View style={styles.header}>
          <ImageBackground
            source={require("../assets/wave-3.jpg")}
            resizeMode="cover"
            style={{ flex: 1 }}
          ></ImageBackground>
          <View style={styles.backBtn}>
            <TouchableOpacity
              onPress={() => {
                props?.mainScreen();
              }}
            >
              <AntDesign name="leftcircle" size={32} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.heading}>
            <Text style={styles.headingText}>Welcome{"\n"}Back</Text>
          </View>
        </View>

        <View
          style={[
            {
              flex: 1,
              flexDirection: "row",
              backgroundColor: "#f0fbfd",
              paddingTop: 20,
            },
          ]}
        >
          <View style={{ paddingHorizontal: 30, width: "100%" }}>
            <View>
              <TextInput
                value={usernameEmail}
                label="Username/Email"
                variant="standard"
                onChangeText={(el) => setUsernameEmail(el)}
                style={{ marginBottom: 16 }}
                ref={textInput0}
                onSubmitEditing={() => textInput1?.current?.focus()}
              />
            </View>
            <View>
              <TextInput
                value={password}
                label="Enter Password"
                variant="standard"
                onChangeText={(el) => setPassword(el)}
                ref={textInput1}
                onSubmitEditing={handleFormSubmit}
                secureTextEntry={showPassword}
                autoCorrect={false}
                trailing={
                  <IconButton
                    onPress={() => setShowPassword((el) => !el)}
                    style={{ right: 10, bottom: 3 }}
                    icon={(props) =>
                      showPassword ? (
                        <Entypo name="eye" size={24} color="black" {...props} />
                      ) : (
                        <Entypo
                          name="eye-with-line"
                          size={24}
                          color="black"
                          {...props}
                        />
                      )
                    }
                  />
                }
              />
            </View>
            <Animated.View style={{ top: 80, alignItems: "flex-end" }}>
              {validData ? (
                <TouchableOpacity onPress={handleFormSubmit}>
                  <FontAwesome5
                    name="arrow-circle-right"
                    size={60}
                    color="green"
                  />
                </TouchableOpacity>
              ) : (
                <Entypo name="circle-with-cross" size={60} color="red" />
              )}
            </Animated.View>
          </View>
        </View>
      </Stack>
      {loading && <Loading />}
      {error && <Error message={errMessage} errorClose={handleErrorClick} />}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    width: width,
    height: height / 3,
    backgroundColor: "#fff",
  },
  backBtn: {
    position: "absolute",
    zIndex: 1,
    marginLeft: 20,
    marginTop: 50,
  },
  heading: {
    position: "absolute",
    backgroundColor: "transparent",
    width: width,
    height: "50%",
    bottom: 0,
  },
  headingText: {
    fontSize: 30,
    color: "#049bc4",
    paddingLeft: 24,
  },
});
