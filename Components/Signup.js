import React, { Component, useEffect, useRef, useState } from "react";
import {
    Image,
    StyleSheet,
    BackHandler,
    View,
    Alert,
    TouchableOpacity,
    Dimensions,
    Keyboard,
    Text
} from "react-native";
import { Stack, TextInput, IconButton, Button } from "@react-native-material/core";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import { apisPath, paths } from "../Utils/path.js";
import http from "./Services/utility.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import Loading from "../Shared/Loading.js";
import Error from "../Shared/Error.js";


const windowsWidth = Dimensions.get('window').width;
export default function Signup(props) {
    const textInput0 = useRef();
    const textInput1 = useRef();
    const textInput2 = useRef();
    const textInput3 = useRef();
    const textInput4 = useRef();
    const textInput5 = useRef();
    const [translate, setTranslate] = useState(-props?.onStep * windowsWidth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Somthing Gonna Happen!")
    const [registerData, setregisterData] = useState({
        name: "",
        username: "",
        email: "",
        mobile: "",
        password: "",
    });

    const [formStep, setFormStep] = useState(props?.onStep ? props?.onStep : 0);
    const [validUsername, setvalidUsername] = useState(false);
    const [validEmail, setvalidEmail] = useState(false);
    const [validMobile, setvalidMobile] = useState(false);
    const [validPassword, setvalidPassword] = useState(false);
    const [validRePassword, setvalidRePassword] = useState(false);
    const [validOTP, setvalidOTP] = useState(false);
    const [username, setUsername] = useState({
        username: "",
    });
    const [email, setEmail] = useState({
        email: "",
    });
    const [mobile, setMobile] = useState({
        mobile: "",
    });
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [OTP, setOTP] = useState("");

    useEffect(() => {
        if (props?.focus) {
            if (props?.onStep === 4) {
                setTimeout(() => {
                    textInput5?.current?.focus();
                }, 1000);
            }
            else {
                setTimeout(() => {
                    textInput0.current.focus()
                }, 1000);
            }
        }
    }, [props?.focus])

    useEffect(() => {

        const backAction = () => {
            if (formStep !== 0 && props?.onStep !== 4) {
                setFormStep(formStep - 1);
            } else if (props?.onStep === 4 || formStep === 0) {
                Alert.alert("Hold on!", "Are you sure you want to go back?", [
                    {
                        text: "Cancel",
                        onPress: () => null,
                        style: "cancel",
                    },
                    { text: "YES", onPress: () => props?.pageRender(0) },
                ]);
                return true;
            } else {
                props?.pageRender(0);
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setTranslate(-formStep * windowsWidth);
        (formStep === 0 && props?.focus
            ? textInput0
            : formStep === 1
                ? textInput3
                : formStep === 2 && props?.focus ?
                    textInput5 : ""
        )?.current?.focus();
    }, [formStep]);

    // api call functions
    const handleFormSubmit = () => {
        setLoading(true);
        http
            .post(apisPath?.user?.user, {
                ...registerData,
                password: password,
            })
            .then((res) => {
                setLoading(false);
                AsyncStorage.setItem("session", res?.data?.session_id);
                setFormStep(2);
            })
            .catch((err) => {
                setLoading(false);
                setErrorMessage(err?.response?.data?.message);
                setError(true);
            });
    };
    const handleFormVerificationSubmit = async () => {
        setLoading(true);
        let session = await AsyncStorage.getItem("session");
        http
            .post(apisPath?.user?.verification, {
                verification_off: "email",
                session: session,
                email_otp: OTP,
            })
            .then((res) => {
                setLoading(false);
                props?.currentStep(-1);
            })
            .catch((err) => {
                setLoading(false);
                setErrorMessage(err?.response?.data?.message);
                setError(true);
            });
    };
    const validateUsername = (val) => {
        http
            .post(apisPath?.user?.validateUsername, { username: val })
            .then((res) => { setvalidUsername(true) })
            .catch((err) => {
                setvalidUsername(false);
            });
    };
    const validateEmail = (val) => {
        http
            .post(apisPath?.user?.validateEmail, { email: val })
            .then((res) => setvalidEmail(true))
            .catch((err) => {
                setvalidEmail(false);
            });
    };
    const validateMobile = (val) => {
        http
            .post(apisPath?.user?.validateMobile, { mobile: val })
            .then((res) => setvalidMobile(true))
            .catch((err) => {
                setvalidMobile(false);
            });
    };

    // next button click handler
    const handleUserEmailMobileClick = () => {
        if (validUsername && validEmail && validMobile) {
            setregisterData({ ...registerData, username: username?.username, email: email?.email, mobile: mobile?.mobile });
            setFormStep(1);
        }
    };

    const handlePasswordClick = () => {
        if (validPassword && validRePassword) {
            handleFormSubmit();
        }
    };

    const handleOTPClick = () => {
        if (validOTP) {
            handleFormVerificationSubmit();
        }
    };


    const registerAgainHandler = () => {
        Alert.alert("You Will Loss the current Login", "Are you sure you want to go back?", [
            {
                text: "Cancel",
                onPress: () => null,
                style: "cancel",
            },
            {
                text: "YES", onPress: () => handleLogout()
            },
        ]);
    }

    const handleLogout = async () => {
        setLoading(true);
        let session = await AsyncStorage.getItem('session')
        console.log(session);
        http.post(apisPath?.user?.userDelete, { session: session }).then(async (res) => {
            await AsyncStorage.removeItem('session');
            setFormStep(0);
            setLoading(false);
        }
        ).catch(err => {
            setLoading(false);
            setError(true);
            setErrorMessage(err?.response?.data?.message)
        })
    }

    const ReRegisterAgainHandler = () => {
        setFormStep(0);
    }

    // handle change all functions
    const nameHandleChange = (el) => {
        if (el?.length > 2) {
            validateUsername(el);
        } else {
            setvalidUsername(false);
        }
        setUsername({
            username: el,
        });
    };

    const emailHandleChange = (el) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(el)) {
            validateEmail(el);
        } else {
            setvalidEmail(false);
        }
        setEmail({
            email: el,
        });
    };

    const mobileHandleChange = (el) => {
        if (el >= 6000000000 && el <= 9999999999) {
            validateMobile(el);
        } else {
            setvalidMobile(false);
        }
        setMobile({
            mobile: el,
        });
    };

    const passwordHandleChange = (el) => {
        if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,24}$/.test(el)) {
            setvalidPassword(true);
        } else {
            setvalidPassword(false);
        }
        setPassword(el);
    };

    const rePasswordHandleChange = (el) => {
        if (validPassword && password === el) {
            setvalidRePassword(true);
        } else {
            setvalidRePassword(false);
        }
        setRePassword(el);
    };

    const otpHandleChange = (el) => {
        if (el >= 100000 && el <= 999999) {
            setvalidOTP(true);
        } else {
            setvalidOTP(false);
        }
        setOTP(el);
    };

    const handleErrorClose = () => {
        setError(false);
    }


    // animation properties
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(translate),
                },
            ],
        };
    });

    return (
        <Stack spacing={2} style={{ flex: 1, flexDirection: "column" }}>
            <View style={styles.backBtn}>
                <TouchableOpacity
                    onPress={() => {
                        props?.mainScreen()
                    }}
                >
                    <AntDesign name="leftcircle" size={36} color="white" />
                </TouchableOpacity>
            </View>
            <View style={{ height: 310 }}>
                <Image source={require("../assets/wave-1.png")} />
            </View>

            <Animated.View style={[{ flexDirection: "row" }, animatedStyle]}>
                {/* register username, email, and mobile view  */}
                <View style={styles.formCont}>
                    <View>
                        <TextInput
                            value={username?.username}
                            label="Username"
                            variant="standard"
                            onChangeText={nameHandleChange}
                            ref={textInput0}
                            onSubmitEditing={() => textInput1?.current?.focus()}
                            color={validUsername ? "green" : 'red'}
                        />
                    </View>
                    <View>
                        <TextInput
                            value={email?.email}
                            label="Email"
                            variant="standard"
                            onChangeText={emailHandleChange}
                            ref={textInput1}
                            onSubmitEditing={() => textInput2?.current?.focus()}
                            color={validEmail ? "green" : 'red'}
                            style={{ color: 'red' }}
                        />
                    </View>
                    <View>
                        <TextInput
                            value={mobile?.mobile}
                            label="Mobile"
                            variant="standard"
                            onChangeText={mobileHandleChange}
                            ref={textInput2}
                            onSubmitEditing={handleUserEmailMobileClick}
                            color={validMobile ? "green" : 'red'}
                        />
                    </View>
                    <View style={styles.formContNext}>
                        {validUsername && validEmail && validMobile ? (
                            <TouchableOpacity onPress={handleUserEmailMobileClick}>
                                <FontAwesome5
                                    name="arrow-circle-right"
                                    size={60}
                                    color="green"
                                />
                            </TouchableOpacity>
                        ) : (
                            <Entypo name="circle-with-cross" size={60} color="red" />
                        )}
                    </View>
                </View>

                {/* register password view */}
                <View style={styles.formCont}>
                    <View>
                        <TextInput
                            color={validPassword ? "green" : "red"}
                            value={password}
                            label="Password"
                            variant="standard"
                            onChangeText={passwordHandleChange}
                            style={{ marginBottom: 6 }}
                            ref={textInput3}
                            autoFocus={formStep === 1 ? true : false}
                            onSubmitEditing={() => textInput4?.current?.focus()}
                        />
                    </View>
                    <View>
                        <TextInput
                            color={validRePassword ? "green" : "red"}
                            value={rePassword}
                            label="Re-Enter Password"
                            variant="standard"
                            onChangeText={rePasswordHandleChange}
                            ref={textInput4}
                            onSubmitEditing={handlePasswordClick}
                        />
                    </View>
                    <View style={[styles.formContNext, { justifyContent: 'space-between' }]}>
                        <TouchableOpacity
                            onPress={() => {
                                setFormStep(2);
                            }}
                        >
                            <AntDesign name="leftcircle" size={60} color="black" />
                        </TouchableOpacity>

                        {validRePassword && validPassword ? (
                            <TouchableOpacity onPress={handlePasswordClick}>
                                <FontAwesome5
                                    name="arrow-circle-right"
                                    size={60}
                                    color="green"
                                />
                            </TouchableOpacity>
                        ) : (
                            <Entypo name="circle-with-cross" size={60} color="red" />
                        )}
                    </View>
                </View>

                {/* register OTP view */}
                <View style={styles.formCont}>
                    <View>
                        <TextInput
                            color={validOTP ? "green" : "red"}
                            value={OTP}
                            label="Email OTP"
                            variant="standard"
                            onChangeText={otpHandleChange}
                            style={{ marginBottom: 6 }}
                            ref={textInput5}
                            autoFocus={props?.onStep === 4 ? true : false}
                            onSubmitEditing={handleOTPClick}
                        />
                    </View>

                    <View style={styles.formContNext}>
                        {validOTP ? (
                            <TouchableOpacity onPress={handleOTPClick}>
                                <FontAwesome5
                                    name="arrow-circle-right"
                                    size={60}
                                    color="green"
                                />
                            </TouchableOpacity>
                        ) : (
                            <Entypo name="circle-with-cross" size={60} color="red" />
                        )}
                    </View>
                    <View style={{ top: 120 }}>
                        <Button key="register_again" color="blue" variant="text" title="Cancel Application" onPress={registerAgainHandler} compact />
                    </View>
                    <View style={{ top: 120 }}>
                        <Button key="register_again" color="blue" variant="text" title="Register Again" onPress={ReRegisterAgainHandler} compact />
                    </View>
                </View>
            </Animated.View>

            {
                loading && (
                    <Loading />
                )
            }
            {
                error && (
                    <Error message={errorMessage} errorClose={handleErrorClose} />
                )
            }
        </Stack >
    );
}

const styles = StyleSheet.create({
    backBtn: {
        position: "absolute",
        top: 32,
        left: 25,
        zIndex: 1,
    },
    formCont: {
        paddingHorizontal: 40,
        width: windowsWidth,
        rowGap: 10
    },
    formContNext: {
        top: 50,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
});
