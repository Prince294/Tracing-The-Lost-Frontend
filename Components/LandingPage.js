import React, { Component, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    Button,
    Dimensions,
    Keyboard,
    SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    withTiming,
} from "react-native-reanimated";
import Login from "./Login";
import Signup from "./Signup";
import { ImageBackground } from "react-native";
import { TouchableOpacity } from "react-native";

const { height, width } = Dimensions.get("window");
export default function LandingPage(props) {
    const [init, setInit] = useState(false);
    const [isRegister, setIsRegister] = useState(true);
    const [btnContPos, setbtnContPos] = useState(0);
    const [signupStep, setSignupStep] = useState(props?.onStep);

    useEffect(() => {
        if (!btnContPos) Keyboard.dismiss();
    }, [btnContPos]);

    const btnAnimateStyle = useAnimatedStyle(() => {
        const interpolation = interpolate(btnContPos, [0, 1], [0, height / 3]);
        return {
            transform: [
                { translateY: withTiming(interpolation, { duration: 1000 }) },
            ],
        };
    });

    const loginAnimateStyle = useAnimatedStyle(() => {
        const interpolation = interpolate(btnContPos, [0, 1], [0, height]);
        return {
            transform: [
                { translateY: withTiming(interpolation, { duration: 1000 }) },
            ],
        };
    });

    const buttonClickHandler = () => {
        setbtnContPos(1);
        setInit(true);
    };

    const revButtonClickHandler = () => {
        Keyboard.dismiss();
        setbtnContPos(0);
    };

    const currentStepHandler = (el) => {
        if (el !== -1) {
            setSignupStep(el);
            setIsRegister(true);
        } else {
            props?.landingPageHandler(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require("../assets/landing-page.jpg")}
                resizeMode="cover"
                style={{ flex: 1 }}
            ></ImageBackground>
            {isRegister && init ? (
                <Animated.View style={[styles.signup, loginAnimateStyle]}>
                    <Signup
                        onStep={signupStep}
                        mainScreen={revButtonClickHandler}
                        focus={btnContPos === 1 ? true : false}
                        currentStep={currentStepHandler}
                    />
                </Animated.View>
            ) : init ? (
                <Animated.View style={[styles.login, loginAnimateStyle]}>
                    <Login
                        mainScreen={revButtonClickHandler}
                        focus={btnContPos === 1 ? true : false}
                        currentStep={currentStepHandler}
                    />
                </Animated.View>
            ) : (
                ""
            )}

            <Animated.View style={[styles.buttonCont, btnAnimateStyle]}>
                <TouchableOpacity
                    onPress={() => {
                        setIsRegister(false);
                        buttonClickHandler();
                    }}
                >
                    <Text style={styles.btn}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        setIsRegister(true);
                        buttonClickHandler();
                    }}
                >
                    <Text style={[styles.btn, styles.btn1]}>Signup</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "flex-end",
    },
    loginCont: {
        top: 0,
    },
    login: {
        position: "absolute",
        height: height,
        // justifyContent: "center",
        alignItems: "center",
        top: -height,
        width: width,
    },
    signup: {
        position: "absolute",
        top: -height,
        height: height,
    },
    buttonCont: {
        position: "absolute",
        padding: 80,
        rowGap: 30,
        width: width,
        height: height / 3,
        bottom: 0,
    },
    btn: {
        textAlign: "center",
        borderRadius: 100,
        borderWidth: 1,
        paddingVertical: 6,
        color: "#fff",
        fontSize: 20,
    },
    btn1: {
        backgroundColor: "#0295d9",
        color: "#000",
    },
});
