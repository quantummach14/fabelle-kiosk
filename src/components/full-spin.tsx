import React from "react";
import { Spin } from "antd";

interface FullScreenSpinProps {
  isLoader: boolean;
  tip?: React.ReactNode;
}

export const FullScreenSpin: React.FC<FullScreenSpinProps> = ({ isLoader, tip = "" }) => (
  <Spin spinning={isLoader} tip={tip} fullscreen />
);
