import React, { useEffect, useState } from "react";
import {
  Alert,
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
  const [traceBtn, setTraceBtn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentLongitude, setCurrentLongitude] = useState();
  const [currentLatitude, setCurrentLatitude] = useState();
  const [distances, setDistances] = useState([]);
  const [selectedPoliceStation, setSelectedPoliceStation] = useState();
  const [policeStationData, setPoliceStationData] = useState([]);
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

      Alert.alert(
        "Detail Found!",
        "Suspect details are send to your police station, Thanks for helping",
        [
          {
            text: "OK",
            onPress: () => null,
            style: "cancel",
          },
        ]
      );
    }
    return () => clearTimeout(interval);
  }, [traceBtn, progress]);

  const HandlePoliceStation = () => {
    setLoading(true);
    http
      .post(apisPath?.user?.findPoliceStations, {
        user_on: [currentLongitude, currentLatitude],
      })
      .then((res) => {
        setLoading(false);
        console.log(res?.data?.data);
        setPoliceStationData(res?.data?.data);
        for (let i = 0; i < res?.data?.data?.length; i++) {
          setDistances((prev) => [...prev, res?.data?.data[i]?.distance]);
        }
        setMapAnimation(1);
        setTimeout(() => {
          ToastAndroid.show(
            "Select any Pin Point Location",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
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
        setLoading(false);
        console.log(res?.data?.data);
        setPoliceStationData(res?.data?.data);
        for (let i = 0; i < res?.data?.data?.length; i++) {
          setDistances((prev) => [...prev, res?.data?.data[i]?.distance]);
        }
        setMapAnimation(1);
        setTimeout(() => {
          ToastAndroid.show(
            "Select any Pin Point Location",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const setCurrentLocation = async () => {
    const foregroundPermission =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundPermission?.granted) {
      foregroundSubscrition = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (location) => {
          //   console.log(location);
          setCurrentLongitude(location?.coords?.longitude);
          setCurrentLatitude(location?.coords?.latitude);
        }
      );
    }
  };

  const handleTrace = async () => {
    // setCurrentLocation();
    // HandlePoliceStation();

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result?.canceled) {
      setSelectedImage(result?.uri);
      setCurrentLocation();
      HandlePoliceStation();
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
        {error && <Error message={errMessage} errorClose={handleErrorButton} />}
      </View>

      <Animated.View style={[styles.policeStationList, mapAnimationStyle]}>
        <Animated.View style={[styles.map, mapAnimationStyle]}>
          <Image
            source={require("../assets/map.jpg")}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>

        <Image
          source={require("../assets/my_location_pin.png")}
          style={[styles.mapPin, styles.myLocation]}
        />
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
          style={[styles.mapPin, styles.mapPin2]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>
        <View style={[styles.line, styles.line2]}>
          <Text style={styles.distance}>{distances[3]}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setSelectedPoliceStation(4);
            setMapAnimation(0);
            handleTracingTheLost();
          }}
          style={[styles.mapPin, styles.mapPin3]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            style={{ width: "100%", height: "100%" }}
            onPress={() => setMapAnimation(0)}
          />
        </TouchableOpacity>
        <View style={[styles.line, styles.line3]}>
          <Text style={styles.distance}>{distances[4]}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedPoliceStation(2);
            setMapAnimation(0);
            handleTracingTheLost();
          }}
          style={[styles.mapPin, styles.mapPin4]}
        >
          <Image
            source={require("../assets/location_pin.png")}
            onPress={() => setMapAnimation(0)}
            style={{ width: "100%", height: "100%" }}
          />
        </TouchableOpacity>
        <View style={[styles.line, styles.line4]}>
          <Text style={styles.distance}>{distances[2]}</Text>
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
    width: width,
    height: height - 60,
    opacity: 0.6,
  },
  mapPin: {
    position: "absolute",
    width: 40,
    height: 60,
  },
  myLocation: {
    width: 50,
    height: 50,
    top: "10%",
    left: "46%",
  },
  mapPin1: {
    top: "25%",
    left: 20,
  },
  line: {
    position: "absolute",
    height: 0,
    borderBottomColor: "black",
    borderBottomWidth: 4,
    borderStyle: "dashed",
    alignItems: "center",
  },
  distance: {
    position: "absolute",
    color: "lime",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  line1: {
    width: 140,
    top: "21%",
    left: 58,
    transform: [{ rotate: "-38deg" }],
  },

  mapPin2: {
    top: "36%",
    right: 50,
  },
  line2: {
    width: 264,
    top: "33%",
    left: 16,
    transform: [{ rotate: "-70deg" }],
  },
  mapPin3: {
    top: "50%",
    left: 70,
  },
  line3: {
    width: 345,
    top: "40.8%",
    left: 48,
    transform: [{ rotate: "87deg" }],
  },
  mapPin4: {
    top: "65%",
    right: 140,
  },
  line4: {
    width: 165,
    top: "26.5%",
    left: 186,
    transform: [{ rotate: "61deg" }],
  },
});
