import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LogBox,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, IconButton, TextInput } from "@react-native-material/core";
import DateTimePicker from "@react-native-community/datetimepicker";
import SelectBox from "react-native-multi-selectbox";
import http from "./Services/utility";
import { apisPath } from "../Utils/path";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../Shared/Loading";
import Error from "../Shared/Error";

const { height, width } = Dimensions.get("window");
export default function Setting(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Somthing Gonna Happen!");
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(props?.data);
  const genderSelectList = [
    { id: "male", item: "Male" },
    { id: "female", item: "Female" },
    { id: "others", item: "Others" },
  ];
  const [gender, setGender] = useState({
    id: props?.data?.gender?.toLowerCase(),
    item: props?.data?.gender,
  });

  useEffect(() => {
    setData((current) => {
      const { id, username, is_verified_user, on_step, ...rest } = current;
      return rest;
    });
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
  }, []);

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result?.canceled) {
      setData((prev) => ({ ...prev, profile_image: result?.assets[0]?.uri }));
    }
  };

  const handleSettingSubmit = async () => {
    setLoading(true);
    var session = await AsyncStorage.getItem("session");
    var formdata = new FormData();
    formdata.append("session", session);
    formdata.append("name", data?.name);
    formdata.append("gender", data?.gender);
    formdata.append("dob", data?.dob);
    formdata.append("profile_image", {
      uri: data?.profile_image,
      name: "userProfile.jpg",
      type: "image/jpg",
    });
    http
      .put(apisPath?.user?.userData, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setLoading(false);
        props?.handleUserDetails();
      })
      .catch((err) => {
        setLoading(false);
        setErrorMessage(err?.response?.data?.message);
        setError(true);
      });
  };

  const handleErrorClose = () => {
    setError(false);
  };
  return (
    <>
      <ScrollView style={styles.scrollMain}>
        <View style={styles.main}>
          <TouchableOpacity style={styles.profile} onPress={handleImageUpload}>
            {data?.profile_image?.length > 0 ? (
              <Image
                source={{ uri: data?.profile_image }}
                style={styles.profile}
              />
            ) : (
              <Image
                source={require("../assets/avatar.jpg")}
                style={styles.profile}
              />
            )}
          </TouchableOpacity>
          <View style={[styles.fields, { marginTop: 30 }]}>
            <TextInput
              value={data?.name}
              label="Name"
              variant="standard"
              onChangeText={(el) => setData((prev) => ({ ...prev, name: el }))}
            />
          </View>
          <View style={styles.fields}>
            <TextInput
              editable={false}
              value={data?.dob}
              label="Date Of Birth"
              variant="standard"
              trailing={
                <IconButton
                  onPress={() => setOpen(true)}
                  style={{ right: 10, bottom: 3 }}
                  icon={(props) => (
                    <AntDesign
                      name="calendar"
                      size={26}
                      color="black"
                      {...props}
                    />
                  )}
                />
              }
            />

            {open && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={(dat, el) => {
                  setOpen(false);
                  setData((prev) => ({
                    ...prev,
                    dob: el.toLocaleDateString("en-GB"),
                  }));
                  setDate(el);
                }}
              />
            )}
          </View>
          <View style={styles.fields}>
            <TextInput
              value={data?.mobile?.toString()}
              label="Mobile"
              variant="standard"
              editable={false}
              style={{
                backgroundColor: "rgba(100,100,100,0.2)",
                paddingTop: 10,
              }}
            />
          </View>
          <View style={styles.fields}>
            <TextInput
              value={data?.email}
              label="Email"
              variant="standard"
              editable={false}
              style={{
                backgroundColor: "rgba(100,100,100,0.2)",
                paddingTop: 10,
              }}
            />
          </View>
          <View style={styles.fields}>
            <SelectBox
              label="Select Gender"
              options={genderSelectList}
              value={gender}
              onChange={(el) => {
                setData((prev) => ({ ...prev, gender: el?.item }));
                setGender(el);
              }}
              hideInputFilter={true}
              listOptionProps={{ nestedScrollEnabled: true }}
            />
          </View>
          <View style={[styles.fields, styles.formSubmit]}>
            <TouchableOpacity onPress={handleSettingSubmit}>
              <FontAwesome5 name="check-circle" size={60} color="green" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {loading && <Loading />}
      {error && <Error message={errorMessage} errorClose={handleErrorClose} />}
    </>
  );
}

const styles = StyleSheet.create({
  scrollMain: {
    width: width,
    height: height,
  },
  main: {
    width: width,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 40,
    rowGap: 12,
  },
  profile: {
    width: 110,
    height: 110,
    borderRadius: 60,
  },
  fields: {
    width: width,
    paddingHorizontal: 40,
  },
  formSubmit: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 40,
  },
});
