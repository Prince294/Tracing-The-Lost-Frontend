import { Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Button } from '@react-native-material/core'

export default function Error(props) {
    useEffect(() => {
        Keyboard.dismiss();
    }, [])

    return (
        <View style={styles.errorCont}>
            <View style={styles.error}>
                <Text>{props.message}</Text>
                <Button title="Ok" onPress={() => props?.errorClose()}></Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    errorCont: {
        height: "100%",
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
        paddingHorizontal: 30
    },
    error: {
        minWidth: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        rowGap: 16

    },
})