import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  PermissionsAndroid,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableHighlight,
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [currentLongitude, setCurrentLongitude] = useState();
  const [currentLatitude, setCurrentLatitude] = useState();
  const [distances, setDistances] = useState([]);
  const [selectedPoliceStation, setSelectedPoliceStation] = useState();
  const [policeStationData, setPoliceStationData] = useState([]);
  const [traceMsg, setTraceMsg] = useState("");
  const [traceTitle, setTraceTitle] = useState("");
  const [progressTime, setProgressTime] = useState(200);
  const [progressDropStep, setProgressDropStep] = useState(1);
  var interval;

  useEffect(() => {
    const backAction = () => {
      if (mapAnimation === 1) {
        setMapAnimation(0);
      }
      return true;
    };
    setCurrentLocation();
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
        user_on: [currentLatitude, currentLongitude],
      })
      .then((res) => {
        // console.log(res?.data?.data);
        var data = res?.data?.data;
        if (data.length < 4) {
          setErrMsg(
            "Server Deals with high amount of traffic, Please Try after some Time."
          );
          setError(true);
          setLoading(false);
          return;
        }

        data.sort((a, b) => {
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
        setPoliceStationData(data);
        for (let i = 0; i < data?.length; i++) {
          setDistances((prev) => [...prev, data[i]?.distance]);
        }
        setMapAnimation(1);
        setTimeout(() => {
          ToastAndroid.show(
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

  const handleTracingTheLost = async () => {
    setTimeout(() => {
      setTraceBtn(true);
    }, 1300);
    let session = await AsyncStorage.getItem("session");
    var formdata = new FormData();
    formdata.append("session", session);
    formdata.append(
      "police_station_id",
      policeStationData[selectedPoliceStation]?.station_id
    );
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

  const setCurrentLocation = async (type = false) => {
    const foregroundPermission =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundPermission?.granted) {
      foregroundSubscrition = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
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
    let result = await ImagePicker.launchImageLibraryAsync({
      // let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result?.canceled) {
      setSelectedImage(result?.assets[0]?.uri);
      setCurrentLocation(true);
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
        <Animated.View style={[styles.map, mapAnimationStyle]}>
          <Image
            source={require("../assets/map.jpg")}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
        <View style={styles.myLocationView}>
          <Image
            source={require("../assets/my_location_pin.png")}
            style={[styles.mapPin, styles.myLocation]}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            setSelectedPoliceStation(0);
            setMapAnimation(0);
            handleTracingTheLost();
          }}
          style={[styles.mapPin, styles.mapPin1]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            style={{ width: "100%", height: "100%" }}
          />
          <Text numberOfLines={1} style={styles.addressText}>
            {policeStationData[0]?.address}
          </Text>
        </TouchableOpacity>
        <View style={[styles.line, styles.line1]}>
          <Text style={styles.distance}>{distances[0]}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedPoliceStation(3);
            setMapAnimation(0);
            handleTracingTheLost();
          }}
          style={[styles.mapPin, styles.mapPin3]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            style={{ width: "100%", height: "100%" }}
          />
          <Text numberOfLines={1} style={styles.addressText}>
            {policeStationData[3]?.address}
          </Text>
        </TouchableOpacity>
        <View style={[styles.line, styles.line3]}>
          <Text style={styles.distance}>{distances[3]}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setSelectedPoliceStation(4);
            setMapAnimation(0);
            handleTracingTheLost();
          }}
          style={[styles.mapPin, styles.mapPin4]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            style={{ width: "100%", height: "100%" }}
            onPress={() => setMapAnimation(0)}
          />
          <Text numberOfLines={1} style={styles.addressText}>
            {policeStationData[4]?.address}
          </Text>
        </TouchableOpacity>
        <View style={[styles.line, styles.line4]}>
          <Text style={styles.distance}>{distances[4]}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedPoliceStation(2);
            setMapAnimation(0);
            handleTracingTheLost();
          }}
          style={[styles.mapPin, styles.mapPin2]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            onPress={() => setMapAnimation(0)}
            style={{ width: "100%", height: "100%" }}
          />
          <Text numberOfLines={1} style={styles.addressText}>
            {policeStationData[2]?.address}
          </Text>
        </TouchableOpacity>
        <View style={[styles.line, styles.line2]}>
          <Text style={styles.distance}>{distances[2]}</Text>
        </View>
      </Animated.View>
    </>
  );
}

var pi = Math.PI;

let hyp1 = Math.sqrt(
  Math.pow(width / 2 - 25 - width / 10, 2) +
    Math.pow((15 * height) / 100 - 30, 2)
);
let width1 =
  width / 2 - width / 10 - 65 > (15 * height) / 100 - 50
    ? (15 * height) / 100 - 50
    : width / 2 - width / 10 - 65;

let line1Ang = Math.acos(width1 / hyp1);
line1Ang = 360 - line1Ang * (180 / pi);

let hyp2 = Math.sqrt(
  Math.pow(width / 2 - 25 - width / 10, 2) +
    Math.pow((25 * height) / 100 - 30, 2)
);
let line2Ang = Math.acos((width / 2 - 25 - width / 10) / hyp2);
line2Ang = line2Ang * (180 / pi);

let hyp3 = Math.sqrt(
  Math.pow(width / 2 - 25 - width / 5, 2) +
    Math.pow((40 * height) / 100 - 30, 2)
);
let line3Ang = Math.acos((width / 2 - 25 - width / 5) / hyp3);
line3Ang = 360 - line3Ang * (180 / pi);

let hyp4 = Math.sqrt(
  Math.pow(width / 2 - 25 - (30 * width) / 100, 2) +
    Math.pow((55 * height) / 100 - 30, 2)
);
let line4Ang = Math.acos((width / 2 - 25 - (30 * width) / 100) / hyp4);
line4Ang = line4Ang * (180 / pi);

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
  distance: {
    position: "absolute",
    color: "lime",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  addressText: {
    color: "white",
  },
  map: {
    width: width,
    height: height,
    opacity: 0.6,
  },
  mapPin: {
    position: "absolute",
    width: 40,
    height: 60,
  },
  myLocationView: {
    position: "absolute",
    left: 0,
    top: height / 10,
    width: width,
    alignItems: "center",
  },
  myLocation: {
    width: 50,
    height: 50,
  },
  mapPin1: {
    top: (25 * height) / 100,
    left: width / 10,
  },
  line: {
    position: "absolute",
    height: 0,
    borderBottomColor: "black",
    borderBottomWidth: 4,
    borderStyle: "dashed",
    alignItems: "center",
  },
  line1: {
    width: hyp1,
    top: (17.5 * height) / 100 + 25,
    left: (width / 2 - 25 - width / 10) / 2 + 2,
    transform: [{ rotate: line1Ang + "deg" }],
  },

  mapPin2: {
    top: (35 * height) / 100,
    right: (10 * width) / 100,
  },
  line2: {
    width: hyp2 - 30,
    top: (22.5 * height) / 100 + 20,
    right: (width / 2 - width / 10 - 25) / 2 - 30,
    transform: [{ rotate: line2Ang + 5 + "deg" }],
  },
  mapPin3: {
    top: (50 * height) / 100,
    left: (20 * width) / 100,
  },
  line3: {
    width: hyp3 - 30,
    top: (30 * height) / 100 + 20,
    left: (width / 2 - 25 - width / 5) / 2 - 26,
    transform: [{ rotate: line3Ang - 2 + "deg" }],
  },
  mapPin4: {
    top: (65 * height) / 100,
    right: (30 * width) / 100,
  },
  line4: {
    width: hyp4 - 30,
    top: (37.5 * height) / 100 + 30,
    right: (width / 2 - (30 * width) / 100 - 25) / 2 - 40,
    transform: [{ rotate: line4Ang + "deg" }],
  },
});
