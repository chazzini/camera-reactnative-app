import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Filesystem from "expo-file-system";
import path from "path";

type Media = {
  name: string;
  uri: string;
};

const HomeScreen = () => {
  const [files, setFiles] = useState<Media[]>();

  useFocusEffect(
    useCallback(() => {
      LoadFiles();
    }, [])
  );

  console.log(files);
  const LoadFiles = async () => {
    if (!Filesystem.documentDirectory) {
      return;
    }
    const files = await Filesystem.readDirectoryAsync(
      Filesystem.documentDirectory
    );

    setFiles(
      files.map((file) => {
        return { name: file, uri: Filesystem.documentDirectory + file };
      })
    );
  };
  return (
    <View style={style.container}>
      <FlatList
        data={files}
        numColumns={3}
        contentContainerStyle={{ gap: 2 }}
        columnWrapperStyle={{ gap: 2 }}
        renderItem={({ item }) => {
          if (path.parse(item.uri).ext === ".jpg") {
            return (
              <View
                style={{ width: 100, height: 133, backgroundColor: "#eee" }}
              >
                <Link href={`${item.name}`} asChild>
                  <Pressable style={{ flex: 1 }}>
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  </Pressable>
                </Link>
              </View>
            );
          }
        }}
      />
      <Link href={"camera"} asChild>
        <Pressable style={style.floatingButton}>
          <MaterialCommunityIcons name="camera" size={24} color="white" />
        </Pressable>
      </Link>
    </View>
  );
};

export default HomeScreen;

const style = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButton: {
    backgroundColor: "royalblue",
    color: "white",
    padding: 20,
    borderRadius: 100,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
});
