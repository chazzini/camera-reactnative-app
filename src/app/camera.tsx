import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  Button,
  Pressable,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  useCameraPermissions,
  CameraView,
  CameraType,
  CameraCapturedPicture,
} from "expo-camera";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import path from "path";
import * as Filesystem from "expo-file-system";
import { useVideoPlayer, VideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { Audio } from "expo-av";

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasAudioPermission, SetHasAudioPermission] = useState<boolean>(false);

  const [facing, setFacing] = useState<CameraType>("back");
  const [picture, setPicture] = useState<CameraCapturedPicture>();
  const [video, setVideo] = useState<string>();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const camera = useRef<CameraView>(null);

  //ask the user for permission to use camera
  useEffect(() => {
    async () => {
      if (permission && !permission.granted && permission.canAskAgain) {
        requestPermission();
      }
      if (!hasAudioPermission) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status === "granted") SetHasAudioPermission(true);
      }
    };
  }, [permission]);

  if (!permission?.granted) {
    return <ActivityIndicator />;
  }

  const toggleCamera = () => {
    setFacing((prev) => (prev === "front" ? "back" : "front"));
    console.log("change camera:", facing);
  };

  const onPress = async () => {
    if (isRecording) {
      camera.current?.stopRecording();

      // Video will be set in the recordVideo function after recording stops
    } else {
      captureImage();
    }
  };

  const captureImage = async () => {
    const response = await camera.current?.takePictureAsync();
    setPicture(response);
    console.log(response);
  };
  const recordVideo = async () => {
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    if (camera.current && audioStatus) {
      try {
        setIsRecording(true);
        const video = await camera.current.recordAsync({
          maxDuration: 3, // 30 seconds max
        });
        setVideo(video?.uri);
        console.log(video?.uri);
      } catch (error) {
        console.log("Error recording video:", error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const savePicture = async (uri: string) => {
    const name = path.parse(uri).base;
    await Filesystem.copyAsync({
      from: uri,
      to: Filesystem.documentDirectory + name,
    });
    router.back();
  };

  if (picture || video) {
    let player;
    if (video) {
      player = useVideoPlayer(video, (player) => {
        player.loop = true;
        player.play();
      });
    }
    return (
      <View style={{ flex: 1 }}>
        {picture && (
          <Image
            source={{ uri: picture.uri }}
            style={{ width: "100%", flex: 1 }}
          />
        )}
        {video && (
          <VideoView
            player={player}
            style={{ width: "100%", flex: 1 }}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
          />
        )}
        <View style={{ padding: 10 }}>
          <SafeAreaView edges={["bottom"]}>
            <Button title="save" onPress={() => savePicture(picture.uri)} />
          </SafeAreaView>
        </View>
        <MaterialIcons
          name="close"
          size={24}
          style={style.close}
          onPress={() => {
            setPicture(undefined);
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={style.camera} facing={facing} ref={camera} mirror />
      <View style={style.footer}>
        <View />
        <Pressable
          onPress={onPress}
          onLongPress={recordVideo}
          delayLongPress={300}
        >
          <MaterialIcons
            name="circle"
            size={38}
            color={isRecording ? "red" : "white"}
          />
        </Pressable>
        <MaterialIcons
          name="flip-camera-ios"
          size={24}
          color="white"
          onPress={toggleCamera}
        />
      </View>

      <MaterialIcons
        name="close"
        size={24}
        style={style.close}
        onPress={() => {
          router.back();
        }}
      />
    </View>
  );
};

export default CameraScreen;

const style = StyleSheet.create({
  close: {
    color: "white",
    position: "absolute",
    top: 30,
    left: 20,
  },
  camera: { width: "100%", height: "100%" },
  footer: {
    position: "absolute",
    flexDirection: "row",
    bottom: 0,
    width: "100%",
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#00000099",
    alignItems: "center",
  },
});
