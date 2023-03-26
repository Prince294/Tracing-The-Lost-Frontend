import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import http from "./Services/utility";
import { apisPath } from "../Utils/path";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../Shared/Loading";
import Error from "../Shared/Error";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { AntDesign, FontAwesome5, Entypo } from "@expo/vector-icons";
import { ScrollView } from "react-native";

const { height, width } = Dimensions.get("window");
export default function History() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    let session = await AsyncStorage.getItem("session");
    http
      .post(apisPath?.user?.history, { session: session })
      .then((res) => {
        // console.log(res?.data?.data);
        setData(res?.data?.data);
        setLoading(false);
      })
      .catch((err) => {
        setErrMessage(err?.response?.data?.message);
        setLoading(false);
        setError(true);
      });
  };

  const SortSuccess = () => {
    var obj = [...data];
    obj.sort((a, b) => {
      const nameA = a?.tracking_progress?.toUpperCase();
      const nameB = b?.tracking_progress?.toUpperCase();
      if (nameA > nameB) {
        return -1;
      }
      if (nameA < nameB) {
        return 1;
      }
      return 0;
    });
    setData(obj);
  };

  const SortPending = () => {
    var obj = [...data];
    obj.sort((a, b) => {
      const nameA = a?.tracking_progress?.toUpperCase();
      const nameB = b?.tracking_progress?.toUpperCase();
      if (nameA > nameB) {
        return 1;
      }
      if (nameA < nameB) {
        return -1;
      }
      return 0;
    });
    setData(obj);
  };

  const handleErrorClick = () => {
    setError(false);
  };

  return (
    <>
      <View style={styles.history}>
        <View style={styles.header}>
          <Text style={{ fontSize: 16 }}>Filter:</Text>
          <TouchableOpacity
            onPress={SortSuccess}
            style={[
              styles.progressType,
              {
                backgroundColor: "rgba(0,255,0,0.5)",
                marginTop: 0,
              },
            ]}
          >
            <Text>Success</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={SortPending}
            style={[
              styles.progressType,
              { backgroundColor: "rgba(255,0,0,0.5)", marginTop: 0 },
            ]}
          >
            <Text style={{ color: "white" }}>Pending</Text>
          </TouchableOpacity>
        </View>
        {data?.length > 0 ? (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <View style={styles.listContainer}>
                <ListItems listData={item} />
              </View>
            )}
            keyExtractor={(item) => item.id}
          ></FlatList>
        ) : (
          <View style={styles.notFound}>
            <Text style={{ fontSize: 20 }}>No Data Found</Text>
          </View>
        )}
      </View>
      {loading && <Loading />}
      {error && <Error message={errMessage} errorClose={handleErrorClick} />}
    </>
  );
}

const ListItems = ({ listData }) => {
  return (
    <View style={styles.list}>
      <View>
        <Image
          source={{ uri: listData?.case_image }}
          style={styles.caseImage}
        />
      </View>
      <View style={styles.caseInfo}>
        <Text>Case ID: {listData?.case_id}</Text>
        <Text>Name: {listData?.case_name}</Text>
        <Text>
          Dropped At: {listData?.time_at_droped?.split(".")[0]}{" "}
          {listData?.date_at_droped}
        </Text>
        <View
          style={[
            styles.progressType,
            {
              backgroundColor:
                listData?.tracking_progress === "Pending"
                  ? "rgba(255,0,0,0.5)"
                  : "rgba(0,255,0,0.5)",
            },
          ]}
        >
          <Text
            style={{
              color:
                listData?.tracking_progress === "Pending" ? "white" : "black",
            }}
          >
            {listData?.tracking_progress}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  history: {
    width: width,
    height: height - 80,
  },
  notFound: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 10,
  },
  header: {
    width: width,
    flexDirection: "row",
    columnGap: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  listContainer: {
    flexDirection: "column",
  },
  list: {
    width: width,
    paddingHorizontal: 14,
    paddingVertical: 20,
    flexDirection: "row",
    columnGap: 20,
    alignItems: "center",
    backgroundColor: "rgb(200,200,200)",
    marginBottom: 1,
  },
  caseImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  caseInfo: {
    alignItems: "flex-start",
  },
  progressType: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    borderRadius: 12,
  },
});
