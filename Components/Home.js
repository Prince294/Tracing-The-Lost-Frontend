import React, { Component, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { AppBar, Button, IconButton } from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from './Services/utility';
import { apisPath } from '../Utils/path';
import Loading from '../Shared/Loading';



export default function Home(props) {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        let session = await AsyncStorage.getItem('session')
        http.post(apisPath?.user?.userLogout, { session: session }).then(res => {
            setLoading(false);
        }
        ).catch(err => {
            setLoading(false);
            console.log(err)
        })
        await AsyncStorage.removeItem('session');
        props?.pageRender(0);
    }

    // animation properties
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withTiming(10),
                },
            ],
        };
    });
    return (
        <View style={styles.container}>
            <AppBar
                title="Home"
                centerTitle={true}
                leading={props => (
                    <IconButton icon={props => <Icon name="menu" {...props} />} {...props} />
                )}
                trailing={props => (
                    // <IconButton
                    //     icon={props => <Icon name="dots-vertical" {...props} />}
                    //     {...props}
                    // />
                    <Button key="logout" variant="text" title="Logout" {...props} onPress={handleLogout} />
                )}
            />

            <Animated.View style={[{ flexDirection: "row" }, animatedStyle]}>
            </Animated.View>
            <Text>Home Screen</Text>

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
        paddingTop: 30
    },
});
