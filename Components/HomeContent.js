import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Banner, Button } from "@react-native-material/core";
import * as ImagePicker from 'expo-image-picker';
import { apisPath } from '../Utils/path';
import http from './Services/utility';
import Loading from '../Shared/Loading';
import Error from '../Shared/Error';
import * as Location from "expo-location"


const { height, width } = Dimensions.get('window');
export default function HomeContent(props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const { data } = props;
    const [traceBtn, setTraceBtn] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentLongitude, setCurrentLongitude] = useState();
    const [currentLatitude, setCurrentLatitude] = useState();
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

    const HandlePoliceStation = () => {
        setLoading(true);
        http.post(apisPath?.user?.findPoliceStations, { 'user_on': [currentLatitude, currentLongitude] }).then(res => {
            setLoading(false);
            console.log(res?.data?.data)
        }
        ).catch(err => {
            console.log(err)
            setLoading(false);

        })
    }


    const setCurrentLocation = async () => {
        console.log("in geo location")
        const foregroundPermission = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermission.granted) {
            foregroundSubscrition = Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,
                },
                location => {
                    setCurrentLongitude(location?.coords?.longitude);
                    setCurrentLatitude(location?.coords?.latitude);
                })
        }
    }

    const handleTrace = async () => {
        setCurrentLocation();
        HandlePoliceStation();

        // let result = await ImagePicker.launchCameraAsync({
        //     allowsEditing: true,
        //     quality: 1,
        // });

        // if (!result?.canceled) {
        //     setSelectedImage(result?.uri);
        //     setCurrentLocation();
        //     HandlePoliceStation();
        // }
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
            {loading && (
                <Loading />
            )}
            {error && (
                <Error message={errMessage} errorClose={handleErrorButton} />
            )}
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