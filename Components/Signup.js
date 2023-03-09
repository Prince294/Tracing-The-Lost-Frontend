import React, { Component, useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View, Keyboard, TouchableOpacity } from 'react-native';
import { Stack, TextInput, IconButton } from "@react-native-material/core";
import { AntDesign } from '@expo/vector-icons';
import { apisPath, paths } from "../Utils/path.js";
import http from "./Services/utility.js";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"


export default function Signup() {
    const [translate, setTranslate] = useState(0)
    const [registerData, setregisterData] = useState({
        username: "",
        email: "",
        mobile: "",
        password: ""
    });
    const [formStep, setFormStep] = useState(0)
    const [validUsername, setvalidUsername] = useState(false);
    const [validEmail, setvalidEmail] = useState(false);
    const [validMobile, setvalidMobile] = useState(false);
    const [username, setUsername] = useState({
        username: ""
    });
    const [email, setEmail] = useState({
        email: ""
    });
    const [mobile, setMobile] = useState({
        mobile: ""
    });

    useEffect(() => {
        if (formStep == 0) {
            setTranslate(0)
        }
        else if (formStep == 1) {
            setTranslate(-360)
        }
        else if (formStep == 2) {
            setTranslate(-720)
        }
        else if (formStep == 3) {
            setTranslate(-1080)
        }

    }, [formStep])


    const validateUsername = (val) => {
        http.post(apisPath?.user?.validateUsername, { username: val }).then(res => setvalidUsername(true)).catch(err => { setvalidUsername(false) })
    }

    const nameHandleChange = (el) => {
        if (el?.length > 3) {
            validateUsername(el)
        }
        else {
            setvalidUsername(false)
        }
        setUsername({
            username: el
        });
    }

    const validateEmail = (val) => {
        http.post(apisPath?.user?.validateEmail, { email: val }).then(res => setvalidEmail(true)).catch(err => { setvalidEmail(false) })
    }
    const emailHandleChange = (el) => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(el)) {
            validateEmail(el)
        }
        else {
            setvalidEmail(false)
        }
        setEmail({
            email: el
        });
    }


    const validateMobile = (val) => {
        http.post(apisPath?.user?.validateMobile, { mobile: val }).then(res => setvalidMobile(true)).catch(err => { setvalidMobile(false) })
    }
    const mobileHandleChange = (el) => {
        if (el >= 6000000000 && el <= 9999999999) {
            validateMobile(el)
        }
        else {
            setvalidMobile(false)
        }
        setMobile({
            mobile: el
        });
    }



    // animation properties 
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(translate)
                }
            ]
        }
    })

    return (
        <Stack spacing={2} style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ height: 310 }}>
                <Image source={require('../assets/wave-1.png')} />
            </View>

            <Animated.View style={[{ flexDirection: 'row' }, animatedStyle]}>
                {/* register username view  */}
                <View style={{ paddingHorizontal: 40, width: "100%" }}>
                    <View>
                        <TextInput value={username?.username} label="Username" variant="standard" onChangeText={nameHandleChange} />
                    </View>
                    <View style={{ alignItems: 'flex-end', top: 80 }}>
                        <TouchableOpacity onPress={() => { if (validUsername) { setregisterData({ ...registerData, username: username }); setFormStep(1); } }}>
                            <AntDesign name="checkcircle" size={60} color={validUsername ? 'green' : 'red'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* register email view  */}
                <View style={{ paddingHorizontal: 40, width: "100%" }}>
                    <View>
                        <TextInput value={email?.email} label="Email" variant="standard" onChangeText={emailHandleChange} />
                    </View>
                    <View style={{ alignItems: 'flex-end', top: 80 }}>
                        <TouchableOpacity onPress={() => { if (validEmail) { setregisterData({ ...registerData, email: email }); setFormStep(2) } }}>
                            <AntDesign name="checkcircle" size={60} color={validEmail ? 'green' : 'red'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* register mobile view  */}
                <View style={{ paddingHorizontal: 40, width: "100%" }}>
                    <View>
                        <TextInput value={mobile?.mobile} label="Mobile" variant="standard" onChangeText={mobileHandleChange} />
                    </View>
                    <View style={{ alignItems: 'flex-end', top: 80 }}>
                        <TouchableOpacity onPress={() => { if (validMobile) { setregisterData({ ...registerData, mobile: mobile }); setFormStep(3) } }}>
                            <AntDesign name="checkcircle" size={60} color={validMobile ? 'green' : 'red'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* register password view */}
                <View style={{ paddingHorizontal: 40, width: "100%" }}>
                    <View>
                        <TextInput value={mobile?.mobile} label="Password" variant="standard" onChangeText={mobileHandleChange} />
                    </View>
                    <View>
                        <TextInput value={mobile?.mobile} label="Re-Enter Password" variant="standard" onChangeText={mobileHandleChange} />
                    </View>
                    <View style={{ alignItems: 'flex-end', top: 80 }}>
                        <TouchableOpacity onPress={() => { if (validMobile) { setregisterData({ ...registerData, mobile: mobile }); setFormStep(3) } }}>
                            <AntDesign name="checkcircle" size={60} color={validMobile ? 'green' : 'red'} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>


        </Stack >
    )

}

const styles = StyleSheet.create({

})