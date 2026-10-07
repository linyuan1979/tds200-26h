import { View } from "react-native";
import React from "react";

type SpacerProps = { height?: number; width?: number };

export default function Spacer({ height = 16, width }: SpacerProps) {
  return <View style={{ height, width }} />;
}
