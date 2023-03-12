import React, { Component, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LandingPage(props) {
    return (
        <View style={styles.container}>
            <View>
                <Button onPress={() => { props?.pageRender(1) }} title="Login"></Button>
            </View>
            <View>
                <Button onPress={() => { props?.currentStep(0); props?.pageRender(2) }} title="Signup"></Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 80,
        rowGap: 40,
        justifyContent: "center"
    },
});
