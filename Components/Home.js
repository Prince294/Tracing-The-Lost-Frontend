import React, { Component, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { AppBar, Button, IconButton } from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
    interpolate,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from './Services/utility';
import { apisPath } from '../Utils/path';
import Loading from '../Shared/Loading';
import Error from '../Shared/Error';
import SideBar from './SideBar';


const { height, width } = Dimensions.get('window');
const menuListWidth = (5 * width / 6) + 10;
export default function Home(props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false)
    const [menuOpen, setMenuOpen] = useState(1);
    const [userData, setUserData] = useState({});
    const [errMessage, setErrMessage] = useState("")

    useEffect(() => {
        userDetails();
    }, [])

    const userDetails = async () => {
        setLoading(true);
        let session = await AsyncStorage.getItem('session')
        http.post(apisPath?.user?.userData, { session: session }).then(res => {
            setUserData(res?.data?.data);
            setLoading(false);
            setError(false);
        }
        ).catch(err => {
            setLoading(false);
            setError(true);
            setErrMessage(err?.response?.data?.message);
        })
    }

    const handleLogout = async () => {
        setLoading(true);
        let session = await AsyncStorage.getItem('session')
        http.post(apisPath?.user?.userLogout, { session: session }).then(res => {
            setLoading(false);
        }
        ).catch(err => {
            setLoading(false);
        })
        await AsyncStorage.removeItem('session');
        props?.landingPageHandler(true);
    }

    // animation properties
    const animatedStyle = useAnimatedStyle(() => {
        const interpolation = interpolate(menuOpen, [0, 1], [0, menuListWidth]);
        return {
            transform: [
                {
                    translateX: withTiming(interpolation, { duration: 500 }),
                },
            ],
        };
    });
    const barAnimatedStyle = useAnimatedStyle(() => {
        const interpolation = interpolate(menuOpen, [0, 1], [0, menuListWidth]);
        return {
            transform: [
                {
                    translateX: withTiming(interpolation, { duration: 500 }),
                },
            ],
        };
    });

    const handleMenuClick = () => {
        setMenuOpen(menuOpen === 0 ? 1 : 0);
    }

    const handleErrorButton = () => {
        setError(false);
        handleLogout();
        props?.landingPageHandler(true);
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[barAnimatedStyle]}>
                <AppBar
                    title="Home"
                    centerTitle={true}
                    leading={props => (
                        <IconButton onPress={handleMenuClick} icon={props => <Icon name="menu" {...props} />} {...props} />
                    )}
                    trailing={props => (
                        <Button key="logout" variant="text" title="Logout" {...props} onPress={handleLogout} />
                    )}
                />
            </Animated.View>

            <Animated.View style={[styles.menuContainer, animatedStyle]}>
                <SideBar data={userData} />
            </Animated.View>
            <Text>Home Screen</Text>

            {loading && (
                <Loading />
            )}
            {error && (
                <Error message={errMessage} errorClose={handleErrorButton} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 30
    },
    menuContainer: {
        position: 'absolute',
        width: menuListWidth,
        height: height,
        backgroundColor: 'white',
        top: 31,
        left: -menuListWidth,
        zIndex: 10,
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 1
    }
});
