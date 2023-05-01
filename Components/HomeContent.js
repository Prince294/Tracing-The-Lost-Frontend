import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { Banner, Button } from "@react-native-material/core";
import * as ImagePicker from "expo-image-picker";
import { apisPath } from "../Utils/path";
import http from "./Services/utility";
import Loading from "../Shared/Loading";
import Error from "../Shared/Error";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PolicePin from "../assets/police_pin.png";
import MyLocation from "../assets/location_pin.png";

const { height, width } = Dimensions.get("window");
export default function HomeContent(props) {
  const { data } = props;
  const [mapAnimation, setMapAnimation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [traceBtn, setTraceBtn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentLongitude, setCurrentLongitude] = useState(null);
  const [currentLatitude, setCurrentLatitude] = useState(null);
  const [traceMsg, setTraceMsg] = useState("");
  const [traceTitle, setTraceTitle] = useState("");
  const [progressTime, setProgressTime] = useState(200);
  const [progressDropStep, setProgressDropStep] = useState(1);
  var interval;
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([
    {
      address: "Marker 1",
      location: { latitude: 28.7215, longitude: 77.70724 },
    },
    {
      address: "Marker 2",
      location: { latitude: 28.7409, longitude: 77.70624 },
    },
    {
      address: "Marker 3",
      location: { latitude: 28.732, longitude: 77.70914 },
    },
    {
      address: "Marker 4",
      location: { latitude: 28.732, longitude: 77.70914 },
    },
  ]);

  useEffect(() => {
    async function fetchLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setCurrentLatitude(location?.coords?.latitude);
      setCurrentLongitude(location?.coords?.longitude);
    }
    fetchLocation();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (mapAnimation === 1) {
        setMapAnimation(0);
      }
      return true;
    };
    SetCurrentLocationFunc();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        backAction();
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (traceBtn) {
      interval = setTimeout(() => {
        setProgress((prev) => {
          if (prev + progressDropStep > 100) {
            return 100;
          } else {
            return prev + progressDropStep;
          }
        });
      }, progressTime);
    }
    if (progress >= 100) {
      setTraceBtn(false);
      setProgress(0);

      Alert.alert(traceTitle, traceMsg, [
        {
          text: "OK",
          onPress: () => null,
          style: "cancel",
        },
      ]);
    }
    return () => clearTimeout(interval);
  }, [traceBtn, progress]);

  const HandlePoliceStation = async () => {
    setLoading(true);
    await http
      .post(apisPath?.user?.findPoliceStations, {
        user_on: [currentLongitude, currentLatitude],
      })
      .then(async (res) => {
        // console.log(res?.data?.data);
        var data = await res?.data?.data?.sort((a, b) => {
          const nameA = a?.distance?.toUpperCase();
          const nameB = b?.distance?.toUpperCase();
          if (nameA > nameB) {
            return 1;
          }
          if (nameA < nameB) {
            return -1;
          }
          return 0;
        });
        if (data?.length < 2) {
          setErrMsg(
            "Server Deals with high amount of traffic, Please Try after some Time."
          );
          setError(true);
          setLoading(false);
          return;
        }

        console.log(data)
        setMarkers(data);
        setMapAnimation(1);
        setTimeout(() => {
          ToastAndroid?.show(
            "Select any Pin Point Location",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        }, 1000);
        setLoading(false);
      })
      .catch((err) => {
        // console.log("police error", err);
        setErrMsg(err?.response?.data?.message);
        setError(true);
        setLoading(false);
      });
  };

  const handleTracingTheLost = async (id) => {
    setTimeout(() => {
      setTraceBtn(true);
    }, 1300);
    let session = await AsyncStorage.getItem("session");
    var formdata = new FormData();
    formdata.append("session", session);
    formdata.append("police_station_id", id);
    formdata.append("case_image", {
      uri: selectedImage,
      name: "caseImage.jpg",
      type: "image/jpg",
    });

    http
      .post(apisPath?.user?.tracingTheLost, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res?.data?.data);
        setTraceTitle("Details Found!");
        setTraceMsg(
          "Suspect details are send to your police station, Thanks for helping"
        );
        // setMapAnimation(0);
        setTimeout(() => {
          setProgressDropStep(5);
          setProgressTime(20);
        }, 1500);
      })
      .catch((err) => {
        setTraceTitle("Details Not Found!");
        setTraceMsg(
          "We are working on it, Please be patience, We'll notify you Once we found the Details."
        );
        setMapAnimation(0);
        if (err?.response?.data?.message !== "Data Not Found") {
          setTraceBtn(false);
          setProgress(0);
          setErrMsg(err?.response?.data?.message);
          setError(true);
        }
      });
  };

  const SetCurrentLocationFunc = async (type = false) => {
    const foregroundPermission =
      await Location?.requestForegroundPermissionsAsync();
    if (foregroundPermission?.granted) {
      foregroundSubscrition = await Location?.watchPositionAsync(
        {
          accuracy: Location?.Accuracy?.High,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLatitude(location?.coords?.latitude);
          setCurrentLongitude(location?.coords?.longitude);
        }
      );
      if (type) {
        HandlePoliceStation();
      }
    }
  };

  const handleTrace = async () => {
    // let result = await ImagePicker.launchImageLibraryAsync({
    let result = await ImagePicker?.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result?.canceled) {
      setSelectedImage(result?.assets[0]?.uri);
      SetCurrentLocationFunc(true);
    }
  };

  const mapAnimationStyle = useAnimatedStyle(() => {
    const scale = interpolate(mapAnimation, [0, 1], [0, 1]);

    return {
      transform: [
        { scale: withDelay(200, withTiming(scale, { duration: 300 })) },
      ],
    };
  });

  const handleErrorButton = () => {
    setError(false);
  };

  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
  };

  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
  };

  return (
    <>
      <View style={styles.homeContent}>
        {!data?.kyc_status && (
          <Banner
            text="Please Complete Your KYC."
            buttons={
              <Button
                key="complete-kyc"
                variant="text"
                title="Complete KYC"
                onPress={() => props?.setting()}
                compact
              />
            }
            style={styles.popup}
          />
        )}
        <View style={styles.progress}>
          <View style={styles.progressCont}>
            <Image
              source={require("../assets/home-progress.png")}
              style={styles.progressImg}
            />
            <View style={styles.progressTextView}>
              <Text style={styles.progressText}>
                {progress === 0 && !traceBtn ? "100" : progress}%
              </Text>
              {traceBtn && <Text style={styles.progressText1}>Searching</Text>}
            </View>
          </View>
        </View>
        <View style={styles.btnContainer}>
          {data?.verified_user && (
            <TouchableOpacity style={styles.btn}>
              <Text>Get Details</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btn} onPress={handleTrace}>
            <Text style={{ fontSize: 16 }}>Trace The Lost</Text>
          </TouchableOpacity>
        </View>
        {loading && <Loading />}
        {error && <Error message={errMsg} errorClose={handleErrorButton} />}
      </View>

      <Animated.View style={[styles.policeStationList, mapAnimationStyle]}>
        {mapAnimation === 1 && region !== null && (
          <MapView
            style={styles.map}
            region={
              region
                ? region
                : {
                  latitude: 28.721,
                  longitude: 77.707,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }
            }
            zoomEnabled={true}
            zoomControlEnabled={true}
          >
            <Marker
              coordinate={{
                latitude: currentLatitude ? currentLatitude : 37.111,
                longitude: currentLongitude ? currentLongitude : 50.111,
              }}
              title="Your Location"
            >
              <Image source={MyLocation} style={{ width: 20, height: 30 }} />
            </Marker>

            {/* police station markers  */}
            {markers?.map((marker) => {
              return (
                <Marker
                  key={marker?.address}
                  coordinate={{
                    latitude: marker?.location?.latitude,
                    longitude: marker?.location?.longitude,
                  }}
                  title={marker?.address}
                  onPress={() => {
                    setMapAnimation(0);
                    handleTracingTheLost(marker?.station_id);
                  }}
                >
                  <Image source={PolicePin} style={styles.stationPin} />
                </Marker>
              );
            })}
          </MapView>
        )}
        <View style={styles.mapBtns}>
          <TouchableOpacity style={styles.mapBtn} onPress={handleZoomIn}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapBtn} onPress={handleZoomOut}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  homeContent: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "rgba(30,180,170,0.1)",
    position: "relative",
  },
  progress: {
    width: width,
    flexDirection: "column",
    alignItems: "center",
    height: (2 * height) / 3 - 120,
  },
  popup: {
    position: "relative",
    width: "100%",
  },
  progressCont: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressImg: {
    position: "absolute",
    width: width,
    height: height / 2 - 10,
    top: -20,
  },
  progressTextView: {
    width: width,
    height: height / 2 - 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    top: 5,
  },
  progressText: {
    fontSize: 60,
    color: "rgb(240,240,250)",
    fontWeight: "600",
  },
  progressText1: {
    fontSize: 46,
    color: "rgb(240,240,250)",
    fontWeight: "600",
  },
  btnContainer: {
    width: width,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 20,
    height: height / 3 - 50,
  },
  btn: {
    paddingHorizontal: 40,
    paddingVertical: 50,
    backgroundColor: "white",
    borderRadius: 10,
  },
  policeStationList: {
    position: "absolute",
    backgroundColor: "rgb(180,180,180)",
    justifyContent: "flex-start",
    alignItems: "center",
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapBtns: {
    backgroundColor: "white",
    zIndex: 10000,
    position: "absolute",
    top: 10,
    left: 10,
    display: "flex",
    justifyContent: "center",
  },
  mapBtn: {
    width: 40,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 30,
  },
  stationPin: {
    width: 25,
    height: 25,
  },
});
