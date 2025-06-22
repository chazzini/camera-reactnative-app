import { View, Text, Image, Platform } from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as Filesystem from "expo-file-system";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

const ImageDetailScreen = () => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const { name } = useLocalSearchParams<{ name: string }>();
  const fileUri = Filesystem.documentDirectory + name;

  const deleteImage = async () => {
    await Filesystem.deleteAsync(fileUri);
    router.back();
  };

  const onSave = async () => {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    console.log(asset);
    router.back();
  };
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Media",
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                marginRight: Platform.OS === "android" ? 16 : 0,
              }}
            >
              <MaterialCommunityIcons
                name="trash-can"
                size={24}
                color="red"
                onPress={deleteImage}
              />
              <MaterialCommunityIcons
                name="zip-disk"
                size={24}
                color="grey"
                onPress={onSave}
              />
            </View>
          ),
        }}
      />
      <Image
        source={{ uri: fileUri }}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
};

export default ImageDetailScreen;
