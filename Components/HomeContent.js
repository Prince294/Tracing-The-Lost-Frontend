import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Banner, Button } from "@react-native-material/core";
import * as ImagePicker from 'expo-image-picker';


const { height, width } = Dimensions.get('window');
export default function HomeContent(props) {
    const { data } = props;
    const [traceBtn, setTraceBtn] = useState(false);
    const [progress, setProgress] = useState(0)
    const [selectedImage, setSelectedImage] = useState(null)
    var interval;


    useEffect(() => {
        if (traceBtn) {
            interval = setTimeout(() => {
                setProgress((prev) => prev + 1);
            }, 10);
        }
        if (progress >= 100) {
            setTraceBtn(false);
            setProgress(0);

            Alert.alert("Detail Found!", "Suspect details are send to your police station, Thanks for helping", [
                {
                    text: 'OK',
                    onPress: () => null,
                    style: 'cancel',
                },
            ])
        }
        return () => clearTimeout(interval)
    }, [traceBtn, progress]);

    const handleTrace = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result?.canceled) {
            setSelectedImage(result?.uri)
        }
    }


    return (
        <View style={styles.homeContent}>
            {!data?.kyc_status && <Banner
                text="Please Complete Your KYC."
                buttons={
                    <Button key="complete-kyc" variant="text" title="Complete KYC" onPress={() => props?.setting()} compact />
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
                <TouchableOpacity style={styles.btn} onPress={handleTrace}><Text style={{ fontSize: 16 }}>Trace The Lost</Text></TouchableOpacity>
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
    },
    progressImg: {
        position: 'absolute',
        width: width,
        height: height / 2 - 10,
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
    },
    btn: {
        paddingHorizontal: 40,
        paddingVertical: 50,
        backgroundColor: 'white',
        borderRadius: 10
    }
})