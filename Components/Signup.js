import React, { Component, useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  BackHandler,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  Text,
} from "react-native";
import {
  Stack,
  TextInput,
  IconButton,
  Button,
} from "@react-native-material/core";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import { apisPath, paths } from "../Utils/path.js";
import http from "./Services/utility.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import Loading from "../Shared/Loading.js";
import Error from "../Shared/Error.js";
import SelectBox from "react-native-multi-selectbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { RadioButton } from "react-native-paper";

const windowsWidth = Dimensions.get("window").width;
export default function Signup(props) {
  const textInput0 = useRef();
  const textInput1 = useRef();
  const textInput2 = useRef();
  const textInput3 = useRef();
  const textInput4 = useRef();
  const textInput5 = useRef();
  const textInput6 = useRef();
  const [translate, setTranslate] = useState(-props?.onStep * windowsWidth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Somthing Gonna Happen!");
  const [registerData, setregisterData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [personalData, setPersonalData] = useState({
    name: "",
    gender: "",
    dob: "",
    profile_image: null,
  });
  const [verifiedData, setVerifiedData] = useState({
    aadhar_number: "",
    is_verified_user: false,
  });

  const [formStep, setFormStep] = useState(props?.onStep ? props?.onStep : 0);
  const [validUsername, setvalidUsername] = useState(false);
  const [validEmail, setvalidEmail] = useState(false);
  const [validMobile, setvalidMobile] = useState(false);
  const [validPassword, setvalidPassword] = useState(false);
  const [validRePassword, setvalidRePassword] = useState(false);
  const [validOTP, setvalidOTP] = useState(false);
  const [username, setUsername] = useState({
    username: "",
  });
  const [email, setEmail] = useState({
    email: "",
  });
  const [mobile, setMobile] = useState({
    mobile: "",
  });
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [OTP, setOTP] = useState("");

  useEffect(() => {
    const backAction = () => {
      if (formStep !== 0 && props?.onStep !== 4) {
        setFormStep(formStep - 1);
      } else if (props?.onStep === 4 || formStep === 0) {
        Alert.alert("Hold on!", "Are you sure you want to go back?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => props?.pageRender(0) },
        ]);
        return true;
      } else {
        props?.pageRender(0);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setTranslate(-formStep * windowsWidth);
  }, [formStep]);

  // api call functions
  const handleFormSubmit = () => {
    setLoading(true);
    http
      .post(apisPath?.user?.user, {
        ...registerData,
        password: password,
      })
      .then((res) => {
        setLoading(false);
        AsyncStorage.setItem("session", res?.data?.session_id);
        setFormStep(2);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err?.response?.data?.message);
        setError(true);
      });
  };
  const handleFormVerificationSubmit = async () => {
    setLoading(true);
    let session = await AsyncStorage.getItem("session");
    http
      .post(apisPath?.user?.verification, {
        verification_off: "email",
        session: session,
        email_otp: OTP,
      })
      .then((res) => {
        setLoading(false);
        setFormStep(3);
        textInput6?.current?.focus();
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err?.response?.data?.message);
        setError(true);
      });
  };

  const handlePersonalDetailSubmit = async () => {
    setLoading(true);
    let session = await AsyncStorage.getItem("session");
    var formdata = new FormData();
    formdata.append("session", session);
    formdata.append("name", personalData?.name);
    formdata.append("gender", personalData?.gender);
    formdata.append("dob", personalData?.dob);
    formdata.append("profile_image", {
      uri: personalData?.profile_image,
      name: "userProfile.jpg",
      type: "image/jpg",
    });
    http
      .post(apisPath?.user?.userDetailUpdate, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setLoading(false);
        setFormStep(4);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err?.response?.data?.message);
        setError(true);
      });
  };

  const handleAadharDetailSubmit = async () => {
    setLoading(true);
    let session = await AsyncStorage.getItem("session");
    var formdata = new FormData();
    formdata.append("session", session);
    formdata.append("aadhar_number", verifiedData?.aadhar_number);
    if (verifiedData?.is_verified_user) {
      formdata.append("verified_user_id_proof", {
        uri: verifiedData?.verified_user_id_proof,
        name: "userProfile.jpg",
        type: "image/jpg",
      });
    }
    http
      .post(apisPath?.user?.userIDVerification, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setLoading(false);
        props?.currentStep(-1);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err?.response?.data?.message);
        setError(true);
      });
  };

  const validateUsername = (val) => {
    http
      .post(apisPath?.user?.validateUsername, { username: val })
      .then((res) => {
        setvalidUsername(true);
      })
      .catch((err) => {
        setvalidUsername(false);
      });
  };
  const validateEmail = (val) => {
    http
      .post(apisPath?.user?.validateEmail, { email: val })
      .then((res) => setvalidEmail(true))
      .catch((err) => {
        setvalidEmail(false);
      });
  };
  const validateMobile = (val) => {
    http
      .post(apisPath?.user?.validateMobile, { mobile: val })
      .then((res) => setvalidMobile(true))
      .catch((err) => {
        setvalidMobile(false);
      });
  };

  // next button click handler
  const handleUserEmailMobileClick = () => {
    if (validUsername && validEmail && validMobile) {
      setregisterData({
        ...registerData,
        username: username?.username,
        email: email?.email,
        mobile: mobile?.mobile,
      });
      setFormStep(1);
    }
  };

  const handlePasswordClick = () => {
    if (validPassword && validRePassword) {
      handleFormSubmit();
    }
  };

  const handleOTPClick = () => {
    if (validOTP) {
      handleFormVerificationSubmit();
    }
  };

  const registerAgainHandler = () => {
    Alert.alert(
      "You Will Loss the current Login",
      "Are you sure you want to go back?",
      [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "YES",
          onPress: () => handleLogout(),
        },
      ]
    );
  };

  const handleLogout = async () => {
    setLoading(true);
    let session = await AsyncStorage.getItem("session");
    console.log(session);
    http
      .post(apisPath?.user?.userDelete, { session: session })
      .then(async (res) => {
        await AsyncStorage.removeItem("session");
        setFormStep(0);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError(true);
        setErrorMessage(err?.response?.data?.message);
      });
  };

  const ReRegisterAgainHandler = () => {
    setFormStep(0);
  };

  // handle change all functions
  const usernameHandleChange = (el) => {
    if (el?.length > 2) {
      validateUsername(el);
    } else {
      setvalidUsername(false);
    }
    setUsername({
      username: el,
    });
  };

  const emailHandleChange = (el) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(el)) {
      validateEmail(el);
    } else {
      setvalidEmail(false);
    }
    setEmail({
      email: el,
    });
  };

  const mobileHandleChange = (el) => {
    if (el >= 6000000000 && el <= 9999999999) {
      validateMobile(el);
    } else {
      setvalidMobile(false);
    }
    setMobile({
      mobile: el,
    });
  };

  const passwordHandleChange = (el) => {
    if (/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,24}$/.test(el)) {
      setvalidPassword(true);
    } else {
      setvalidPassword(false);
    }
    setPassword(el);
  };

  const rePasswordHandleChange = (el) => {
    if (validPassword && password === el) {
      setvalidRePassword(true);
    } else {
      setvalidRePassword(false);
    }
    setRePassword(el);
  };

  const otpHandleChange = (el) => {
    if (el >= 100000 && el <= 999999) {
      setvalidOTP(true);
    } else {
      setvalidOTP(false);
    }
    setOTP(el);
  };

  const handleErrorClose = () => {
    setError(false);
  };

  // animation properties
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(translate),
        },
      ],
    };
  });

  return (
    <Stack spacing={2} style={{ flex: 1, flexDirection: "column" }}>
      <View style={styles.backBtn}>
        <TouchableOpacity
          onPress={() => {
            props?.mainScreen();
          }}
        >
          <AntDesign name="leftcircle" size={36} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 310 }}>
        <Image source={require("../assets/wave-1.png")} />
      </View>

      <Animated.View style={[{ flexDirection: "row" }, animatedStyle]}>
        {/* register username, email, and mobile view  */}
        <View style={styles.formCont}>
          <View>
            <TextInput
              value={username?.username}
              label="Username"
              variant="standard"
              onChangeText={usernameHandleChange}
              ref={textInput0}
              onSubmitEditing={() => textInput1?.current?.focus()}
              color={validUsername ? "green" : "red"}
            />
          </View>
          <View>
            <TextInput
              value={email?.email}
              label="Email"
              variant="standard"
              onChangeText={emailHandleChange}
              ref={textInput1}
              onSubmitEditing={() => textInput2?.current?.focus()}
              color={validEmail ? "green" : "red"}
              style={{ color: "red" }}
            />
          </View>
          <View>
            <TextInput
              value={mobile?.mobile}
              label="Mobile"
              variant="standard"
              onChangeText={mobileHandleChange}
              ref={textInput2}
              onSubmitEditing={handleUserEmailMobileClick}
              color={validMobile ? "green" : "red"}
            />
          </View>
          <View style={styles.formContNext}>
            {validUsername && validEmail && validMobile ? (
              <TouchableOpacity onPress={handleUserEmailMobileClick}>
                <FontAwesome5
                  name="arrow-circle-right"
                  size={60}
                  color="green"
                />
              </TouchableOpacity>
            ) : (
              <Entypo name="circle-with-cross" size={60} color="red" />
            )}
          </View>
        </View>

        {/* register password view */}
        <View style={styles.formCont}>
          <View>
            <TextInput
              color={validPassword ? "green" : "red"}
              value={password}
              label="Password"
              variant="standard"
              onChangeText={passwordHandleChange}
              style={{ marginBottom: 6 }}
              ref={textInput3}
              autoFocus={formStep === 1 ? true : false}
              onSubmitEditing={() => textInput4?.current?.focus()}
            />
          </View>
          <View>
            <TextInput
              color={validRePassword ? "green" : "red"}
              value={rePassword}
              label="Re-Enter Password"
              variant="standard"
              onChangeText={rePasswordHandleChange}
              ref={textInput4}
              onSubmitEditing={handlePasswordClick}
            />
          </View>
          <View
            style={[styles.formContNext, { justifyContent: "space-between" }]}
          >
            <TouchableOpacity
              onPress={() => {
                setFormStep(2);
              }}
            >
              <AntDesign name="leftcircle" size={60} color="black" />
            </TouchableOpacity>

            {validRePassword && validPassword ? (
              <TouchableOpacity onPress={handlePasswordClick}>
                <FontAwesome5
                  name="arrow-circle-right"
                  size={60}
                  color="green"
                />
              </TouchableOpacity>
            ) : (
              <Entypo name="circle-with-cross" size={60} color="red" />
            )}
          </View>
        </View>

        {/* register OTP view */}
        <View style={styles.formCont}>
          <View>
            <TextInput
              color={validOTP ? "green" : "red"}
              value={OTP}
              label="Email OTP"
              variant="standard"
              onChangeText={otpHandleChange}
              style={{ marginBottom: 6 }}
              ref={textInput5}
              autoFocus={props?.onStep === 4 ? true : false}
              onSubmitEditing={handleOTPClick}
            />
          </View>

          <View style={styles.formContNext}>
            {validOTP ? (
              <TouchableOpacity onPress={handleOTPClick}>
                <FontAwesome5
                  name="arrow-circle-right"
                  size={60}
                  color="green"
                />
              </TouchableOpacity>
            ) : (
              <Entypo name="circle-with-cross" size={60} color="red" />
            )}
          </View>
          <View style={{ top: 120 }}>
            <Button
              key="register_again"
              color="blue"
              variant="text"
              title="Cancel Application"
              onPress={registerAgainHandler}
              compact
            />
          </View>
          <View style={{ top: 120 }}>
            <Button
              key="register_again"
              color="blue"
              variant="text"
              title="Register Again"
              onPress={ReRegisterAgainHandler}
              compact
            />
          </View>
        </View>

        {/* register Profile, name, gender, dob view */}
        <View style={styles.formCont}>
          <SignupPersonalDetail
            textInput6={textInput6}
            personalData={personalData}
            setPersonalData={setPersonalData}
            handlePersonalDetailSubmit={handlePersonalDetailSubmit}
          />
        </View>

        {/* register aadharcard and verified user view */}
        <View style={styles.formCont}>
          <SignupAadharDetail
            verifiedData={verifiedData}
            setVerifiedData={setVerifiedData}
            handleAadharDetailSubmit={handleAadharDetailSubmit}
          />
        </View>
      </Animated.View>

      {loading && <Loading />}
      {error && <Error message={errorMessage} errorClose={handleErrorClose} />}
    </Stack>
  );
}

function SignupPersonalDetail({
  textInput6,
  personalData,
  setPersonalData,
  handlePersonalDetailSubmit,
}) {
  const [calanderOpen, setCalanderOpen] = useState(false);
  const genderSelectList = [
    { id: "male", item: "Male" },
    { id: "female", item: "Female" },
    { id: "others", item: "Others" },
  ];
  const [gender, setGender] = useState({});
  const [date, setDate] = useState(new Date());
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result?.canceled) {
      setSelectedImage(result?.assets[0]?.uri);
      setPersonalData((prev) => ({
        ...prev,
        profile_image: result?.assets[0]?.uri,
      }));
    }
  };

  return (
    <>
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity style={styles.profile} onPress={handleImageUpload}>
          <Image
            source={
              !selectedImage
                ? require("../assets/avatar.jpg")
                : { uri: selectedImage }
            }
            style={styles.profile}
          />
        </TouchableOpacity>
      </View>

      <View>
        <TextInput
          value={personalData?.name}
          label="Name"
          variant="standard"
          onChangeText={(el) =>
            setPersonalData((prev) => ({ ...prev, name: el }))
          }
          ref={textInput6}
        />
      </View>
      <View>
        <SelectBox
          label="Select Gender"
          options={genderSelectList}
          value={gender}
          onChange={(el) => {
            setGender(el);
            setPersonalData((prev) => ({ ...prev, gender: el?.item }));
          }}
          hideInputFilter={true}
        />
      </View>
      <View style={{ marginTop: 8 }}>
        <TextInput
          editable={false}
          value={personalData?.dob}
          label="Date Of Birth"
          variant="standard"
          trailing={
            <IconButton
              onPress={() => setCalanderOpen(true)}
              style={{ right: 10, bottom: 3 }}
              icon={(props) => (
                <AntDesign name="calendar" size={26} color="black" {...props} />
              )}
            />
          }
        />
        {calanderOpen && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(dat, date) => {
              setCalanderOpen(false);
              setPersonalData((prev) => ({
                ...prev,
                dob: date.toLocaleDateString("en-GB"),
              }));
              setDate(date);
            }}
          />
        )}
      </View>
      <View style={styles.formContNext}>
        {personalData?.dob !== "" &&
        personalData?.name?.length > 2 &&
        personalData?.gender !== "" ? (
          <TouchableOpacity onPress={handlePersonalDetailSubmit}>
            <FontAwesome5 name="arrow-circle-right" size={60} color="green" />
          </TouchableOpacity>
        ) : (
          <Entypo name="circle-with-cross" size={60} color="red" />
        )}
      </View>
    </>
  );
}

function SignupAadharDetail({
  verifiedData,
  setVerifiedData,
  handleAadharDetailSubmit,
}) {
  const [validAadhar, setValidAadhar] = useState(false);
  const [aadharData, setAadharData] = useState({});

  const [selectedImage, setSelectedImage] = useState(null);

  const aadharHandleChange = (el) => {
    if (el >= 100000000000 && el <= 999999999999) {
      http
        .post(apisPath?.user?.getAadhar, {
          aadhar_number: el,
        })
        .then((res) => {
          setValidAadhar(true);
          setAadharData(res?.data?.data);
        })
        .catch((err) => {
          setValidAadhar(true);
          setAadharData({ found: true });
        });
    } else {
      setValidAadhar(false);
      setAadharData({});
    }
    setVerifiedData((prev) => ({ ...prev, aadhar_number: el }));
  };

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result?.canceled) {
      setSelectedImage(result?.assets[0]?.uri);
      setVerifiedData((prev) => ({
        ...prev,
        verified_user_id_proof: result?.assets[0]?.uri,
      }));
    }
  };

  return (
    <>
      <View>
        <TextInput
          color={validAadhar ? "green" : "red"}
          value={verifiedData?.aadhar_number}
          label="Enter Aadhar Number"
          variant="standard"
          onChangeText={aadharHandleChange}
          style={{ marginBottom: 6 }}
        />
        {!aadharData?.found && validAadhar ? (
          <Text style={{ color: "green", fontSize: 11, top: -6 }}>
            {aadharData?.name}, Address:{" "}
            {aadharData?.address?.length > 20
              ? aadharData?.address?.substring(0, 20) + "..."
              : aadharData?.address}
          </Text>
        ) : validAadhar ? (
          <Text style={{ color: "green", fontSize: 11, top: -6 }}>
            No Data Found
          </Text>
        ) : (
          ""
        )}
      </View>
      <View>
        <Text style={{ marginBottom: 4 }}>Is Verified User?</Text>
        <View style={[styles.inLineView, { columnGap: 30 }]}>
          <View style={styles.inLineView}>
            <RadioButton
              value={verifiedData?.is_verified_user}
              status={verifiedData?.is_verified_user ? "checked" : "unchecked"}
              onPress={() =>
                setVerifiedData((prev) => ({ ...prev, is_verified_user: true }))
              }
            />
            <Text>Yes</Text>
          </View>
          <View style={styles.inLineView}>
            <RadioButton
              value={!verifiedData?.is_verified_user}
              status={!verifiedData?.is_verified_user ? "checked" : "unchecked"}
              onPress={() =>
                setVerifiedData((prev) => ({
                  ...prev,
                  is_verified_user: false,
                }))
              }
            />
            <Text>No</Text>
          </View>
        </View>
      </View>
      {verifiedData?.is_verified_user && (
        <View>
          <TouchableOpacity
            style={styles.uploadImage}
            onPress={handleImageUpload}
          >
            <Image
              source={
                !selectedImage
                  ? require("../assets/upload-img.jpg")
                  : { uri: selectedImage }
              }
              style={{ width: 70, height: 70 }}
            />
            {!selectedImage && <Text>Upload Document</Text>}
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.formContNext}>
        {validAadhar &&
        (!verifiedData?.is_verified_user ||
          (verifiedData?.is_verified_user && selectedImage)) ? (
          <TouchableOpacity onPress={handleAadharDetailSubmit}>
            <FontAwesome5 name="arrow-circle-right" size={60} color="green" />
          </TouchableOpacity>
        ) : (
          <Entypo name="circle-with-cross" size={60} color="red" />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 32,
    left: 25,
    zIndex: 1,
  },
  formCont: {
    paddingHorizontal: 40,
    width: windowsWidth,
    rowGap: 10,
  },
  formContNext: {
    top: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  inLineView: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadImage: {
    width: "60%",
    borderStyle: "dotted",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginTop: 10,
  },
});
