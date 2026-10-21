import { View } from "react-native";
import React from "react";

type SpacerProps = { height?: number; width?: number; testID?: string };

export default function Spacer({ height = 16, width, testID }: SpacerProps) {
  return <View style={{ height, width }} testID={testID} />;
}
