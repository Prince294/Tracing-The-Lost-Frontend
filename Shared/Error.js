import { Dimensions, Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Button } from '@react-native-material/core'

const { height, width } = Dimensions.get('window');
export default function Error(props) {
    useEffect(() => {
        Keyboard.dismiss();
    }, [])

    return (
        <View style={styles.errorCont}>
            <View style={styles.error}>
                <Text style={{ fontSize: 19, fontWeight: "700", color: "red" }}>{props.message}</Text>
                <Button title="Ok" onPress={() => props?.errorClose()} style={{ backgroundColor: "red", paddingHorizontal: 5 }}></Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    errorCont: {
        position: 'absolute',
        height: height,
        width: width,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        paddingHorizontal: 30
    },
    error: {
        minWidth: '85%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        rowGap: 16

    },
})