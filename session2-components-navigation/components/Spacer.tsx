import { View } from "react-native";
import React from "react";

// The simplest example of a component with props.
// Props let the parent control the component's behaviour.
type SpacerProps = {
  height?: number;
  width?: number;
};

export default function Spacer({ height = 16, width }: SpacerProps) {
  return <View style={{ height, width }} />;
}
