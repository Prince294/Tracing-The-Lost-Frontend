import React, { Component, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { Stack, TextInput, IconButton } from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import http from "./Services/utility.js";

export default function Signup() {
    const [usernames, setUsernames] = useState([]);

    useEffect(() => {
        console.log("hlo");
    }, []);

    return (
        <Stack spacing={2} style={{ margin: 16 }}>
            <View>

            </View>
            <TextInput label="Name" variant="standard" />
            <TextInput label="Email" variant="standard" />
            <TextInput label="Password" variant="standard" />
            <TextInput label="Confirm Password" variant="standard" />
        </Stack>
    )

}

const styles = StyleSheet.create({

})