import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { HStack, Banner, Button } from "@react-native-material/core";


const { height, width } = Dimensions.get('window');
export default function HomeContent(props) {
    const { data } = props;
    const [traceBtn, setTraceBtn] = useState(false);
    const [progress, setProgress] = useState(0)
    var interval;

    useEffect(() => {
        if (progress >= 100) {
            clearInterval(interval)
        }
    }, [progress])


    useEffect(() => {
        if (traceBtn) {
            setTimeout(() => {
                setTraceBtn(false);
                interval = setInterval(() => {
                    setProgress((prev) => prev + 1);
                }, 10);
            }, 1000);
        }
        if (progress >= 100)
            return () => clearInterval(interval)
    }, [traceBtn])




    return (
        <View style={styles.homeContent}>
            {!data?.is_verified_user && <Banner
                text="Please Complete Your KYC."
                buttons={
                    <Button key="complete-kyc" variant="text" title="Complete KYC" compact />
                }
                style={styles.popup}
            />}
            <View style={styles.progress}>
                <View style={styles.progressCont}>
                    <Image source={require('../assets/home-progress.png')} style={styles.progressImg} />
                    <Text style={styles.progressText}>{progress === 0 && !traceBtn ? '100' : progress}%</Text>
                </View>
            </View>
            <View style={styles.btnContainer}>
                {data?.verified_user && <TouchableOpacity style={styles.btn}><Text>Get Details</Text></TouchableOpacity>}
                <TouchableOpacity style={styles.btn} onPress={() => setTraceBtn(true)}><Text>Trace The Lost</Text></TouchableOpacity>
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    homeContent: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(30,180,170,0.1)',
        position: 'relative'
    },
    progress: {
        width: width,
        flexDirection: 'column',
        alignItems: 'center',
        height: (2 * height / 3) - 120,
    },
    popup: {
        position: 'relative',
        width: "100%",
    },
    progressCont: {
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
    },
    progressImg: {
        position: 'absolute',
        width: width - 40,
        height: height / 2,
        top: -20,
    },
    progressText: {
        textAlign: 'center',
        height: '100%',
        top: '38%',
        fontSize: 60,
        color: 'rgb(240,240,250)',
        fontWeight: '600',
    },
    btnContainer: {
        width: width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        columnGap: 20,
        height: height / 3 - 50,
        // backgroundColor: 'red'
    },
    btn: {
        paddingHorizontal: 40,
        paddingVertical: 50,
        backgroundColor: 'white',
        borderRadius: 10
    }
})