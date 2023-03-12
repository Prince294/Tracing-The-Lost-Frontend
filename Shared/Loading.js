import { Image, Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

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
        height: "100%",
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    loading: {
        height: 140,
        width: 140,
    },
})