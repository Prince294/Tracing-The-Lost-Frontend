import { StyleSheet, Text, View } from "react-native";
import React from "react";
import http from "./Services/utility";
import { apisPath } from "../Utils/path";

export default function History() {
  useEffect(() => {
    http
      .post(apisPath?.user?.validateUsername, { username: val })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <View>
      <Text>History</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
