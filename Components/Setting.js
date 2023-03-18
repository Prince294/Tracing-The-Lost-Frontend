import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import { Ionicons, AntDesign } from '@expo/vector-icons';

import { Button, IconButton, TextInput } from '@react-native-material/core';
import DateTimePicker from '@react-native-community/datetimepicker';



const { height, width } = Dimensions.get('window');
export default function Setting(props) {
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false)
    const { data } = props;

    useEffect(() => {
        console.log(date)
    }, [date])


    return (
        <View style={styles.main}>
            <View>
                {data?.profile?.length > 0 ?
                    <Image source={data?.profile} style={styles.profile} />
                    :
                    <Image source={require('../assets/avatar.jpg')} style={styles.profile} />
                }
            </View>
            <View style={[styles.fields, { marginTop: 30 }]}>
                <TextInput value={data?.name} label="Name" variant="standard" />
            </View>
            <View style={styles.fields}>
                <TextInput editable={false} value={date} label="Date Of Birth" variant="standard" trailing={
                    <IconButton onPress={() => setOpen(true)} style={{ right: 10, bottom: 3 }} icon={props => <AntDesign name="calendar" size={26} color="black" {...props} />} />
                } />

                {open && <DateTimePicker value={date} mode="date" onConfirm={dat => { setOpen(false); setDate(new Date(dat)) }} />}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        width: width,
        flexDirection: "column",
        alignItems: 'center',
        paddingVertical: 40,
        rowGap: 12
    },
    profile: {
        width: 110,
        height: 110,
        borderRadius: 60,
    },
    fields: {
        width: width,
        paddingHorizontal: 40,
    }
})