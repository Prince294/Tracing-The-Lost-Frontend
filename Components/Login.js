import React, { Component, useEffect, useRef, useState } from 'react';
import { Stack, TextInput, IconButton } from "@react-native-material/core";
import { Image, StyleSheet, Alert, TouchableOpacity, View, BackHandler, Keyboard, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import { apisPath } from '../Utils/path';
import http from './Services/utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../Shared/Loading';
import Error from '../Shared/Error';


const { height, width } = Dimensions.get('window');
export default function Login(props) {
    const textInput0 = useRef();
    const textInput1 = useRef();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [errMessage, setErrMessage] = useState("")
    const [usernameEmail, setUsernameEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validData, setValidData] = useState(true)


    useEffect(() => {
        const backAction = () => {
            Alert.alert('Hold on!', 'Are you sure you want to go back?', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'YES', onPress: () => props?.mainScreen() },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);


    useEffect(() => {

        if (usernameEmail?.length > 2 && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,24}$/.test(password)) {
            setValidData(true);
        }
        else {
            setValidData(false);
        }
    }, [password, usernameEmail])

    const handleFormSubmit = () => {
        setLoading(true);
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(usernameEmail)) {
            http.post(apisPath?.user?.userLogin, { password: password, email: usernameEmail }).then(res => {
                setLoading(false);
                AsyncStorage.setItem('session', res?.data?.session_id);
                props?.currentStep(res?.data?.data?.on_step)
            }
            ).catch(err => { setLoading(false); setError(true); setErrMessage(err?.response?.data?.message) })
        }
        else {
            http.post(apisPath?.user?.userLogin, { password: password, username: usernameEmail }).then(res => {
                setLoading(false);
                AsyncStorage.setItem('session', res?.data?.session_id);
                props?.currentStep(res?.data?.data?.on_step)
            }
            ).catch(err => { setLoading(false); setError(true); setErrMessage(err?.response?.data?.message) })
        };
    }

    const handleErrorClick = () => {
        setError(false);
    }


    return (
        <>
            <Stack spacing={2} style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.backBtn}>
                    <TouchableOpacity onPress={() => { props?.mainScreen() }}>
                        <AntDesign name="leftcircle" size={36} color='#b396cb' />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 310 }}>
                    <Image source={require('../assets/wave-2.png')} />
                </View>

                <View style={[{ flexDirection: 'row' }]}>
                    <View style={{ paddingHorizontal: 60, width: "100%" }}>
                        <View >
                            <TextInput value={usernameEmail} label="Username/Email" variant="standard" onChangeText={(el) => setUsernameEmail(el)} style={{ marginBottom: 6 }} ref={textInput0} onSubmitEditing={() => textInput1?.current?.focus()} />
                        </View>
                        <View>
                            <TextInput value={password} label="Enter Password" variant="standard" onChangeText={(el) => setPassword(el)} ref={textInput1} onSubmitEditing={handleFormSubmit} />
                        </View>
                        <Animated.View style={{ top: 80, alignItems: 'flex-end' }}>
                            {validData ? <TouchableOpacity onPress={handleFormSubmit}>
                                <FontAwesome5
                                    name="arrow-circle-right"
                                    size={60}
                                    color="green"
                                />
                            </TouchableOpacity> :
                                <Entypo name="circle-with-cross" size={60} color="red" />
                            }
                        </Animated.View>
                    </View>
                </View>


            </Stack>
            {
                loading && (
                    <Loading />
                )
            }
            {
                error && (
                    <Error message={errMessage} errorClose={handleErrorClick} />
                )
            }
        </>
    );
}

const styles = StyleSheet.create({
    backBtn: {
        position: 'absolute',
        top: 43,
        left: 50,
        zIndex: 1
    }
});
