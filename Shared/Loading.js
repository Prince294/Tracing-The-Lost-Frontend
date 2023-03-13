import { Dimensions, Image, Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

const { height, width } = Dimensions.get('window');
export default function Loading() {
    useEffect(() => {
        Keyboard.dismiss();
    }, [])
    return (
        <View style={styles.loadingCont}>
            <Image
                source={require("../assets/loading.gif")}
                style={styles.loading}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    loadingCont: {
        height: height,
        width: width,
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,

    },
    loading: {
        height: 140,
        width: 140
    },
})