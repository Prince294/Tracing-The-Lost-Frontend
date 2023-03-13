import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HStack, Banner, Button } from "@react-native-material/core";


const { height, width } = Dimensions.get('window');
export default function HomeContent(props) {
    const { data } = props;
    useEffect(() => {
        console.log(data)
    }, [])

    return (
        <View style={styles.homeContent}>
            <View style={styles.progress}>

                {/* <Banner
                    text="There was a problem processing a transaction on your credit card."
                    buttons={
                        <HStack spacing={2}>
                            <Button key="fix-it" variant="text" title="Fix it" compact />
                            <Button key="learn-more" variant="text" title="Learn More" compact />
                        </HStack>
                    }
                /> */}

                <View style={styles.progressCont}>
                    <Image source={require('../assets/home-progress.png')} style={styles.progressImg} />
                    <Text style={styles.progressText}>100%</Text>
                </View>
            </View>
            <View style={styles.btnContainer}>
                {data?.verified_user && <TouchableOpacity style={styles.btn}><Text>Get Details</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.btn}><Text>Trace The Lost</Text></TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    homeContent: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: 'rgba(30,180,170,0.1)'
    },
    progress: {
        width: '100%',
        flex: 1,
        left: 0,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressCont: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressImg: {
        position: 'absolute',
        width: "100%",
        height: '100%',
        top: 0,
    },
    progressText: {
        textAlign: 'center',
        height: '100%',
        top: '44%',
        fontSize: 60,
        color: 'rgb(240,240,250)',
        fontWeight: '600',
    },
    btnContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        columnGap: 20,
    },
    btn: {
        paddingHorizontal: 40,
        paddingVertical: 50,
        backgroundColor: 'white',
        borderRadius: 10
    }
})