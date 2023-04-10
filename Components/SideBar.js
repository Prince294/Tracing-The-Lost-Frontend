import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Divider, IconButton, ListItem } from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";

const { height, width } = Dimensions.get("window");
export default function SideBar(props) {
  const { data } = props;
  return (
    <SafeAreaView style={styles.sidebar}>
      <View style={{ position: "absolute", right: 10, zIndex: 1 }}>
        <IconButton
          onPress={props?.handleBack}
          icon={(props) => (
            <Ionicons name="arrow-back-outline" size={24} color="black" />
          )}
        />
      </View>
      <View style={styles.profileSection}>
        <View>
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
        </View>
        <View>
          <View style={styles.usertext}>
            <Text style={styles.subText}>Username: </Text>
            <Text style={styles.text}>{data?.username}</Text>
          </View>
          <View style={styles.usertext}>
            <Text style={styles.subText}>Mobile: </Text>
            <Text style={styles.text}>{data?.mobile}</Text>
          </View>
        </View>
      </View>
      <Divider color="black" />
      <View style={styles.listItems}>
        <ListItem
          title="Home"
          leading={<Icon name="home" size={24} />}
          style={styles.listItem}
          onPress={() => {
            props?.handleBack();
            props?.home();
          }}
        />
        <ListItem
          title="History"
          leading={<Icon name="history" size={24} />}
          style={styles.listItem}
          onPress={() => {
            props?.handleBack();
            props?.history();
          }}
        />
        <ListItem
          title="Setting"
          leading={<Ionicons name="settings" size={22} color="black" />}
          style={styles.listItem}
          onPress={() => {
            props?.handleBack();
            props?.setting();
          }}
        />
        <ListItem
          title="Logout"
          leading={<AntDesign name="logout" size={22} color="black" />}
          style={styles.listItem}
          onPress={() => {
            props?.handleBack();
            props?.logout();
          }}
        />
      </View>
      <View style={styles.bottamText}>
        <Text>v1.0 &copy;Tracing The Lost</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    flexDirection: "column",
    rowGap: 20,
  },
  profileSection: {
    flexDirection: "row",
    columnGap: 20,
    alignItems: "center",
    padding: 20,
  },
  usertext: {
    flexDirection: "row",
    alignItems: "center",
  },
  subText: {
    textTransform: "capitalize",
    fontSize: 16,
  },
  text: {
    textTransform: "capitalize",
    fontSize: 18,
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  listItems: {
    backgroundColor: "white",
    flexDirection: "column",
  },
  listItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottamText: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
});
