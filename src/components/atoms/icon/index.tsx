import React from "react";
import { Icon } from "@iconify/react";

interface IconProps {
  name: string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
}

const Index = ({ name, width = 24, height = 24, color, className }: IconProps) => {
  const iconName = name.includes(":") ? name : `${name}`;

  return (
    <Icon
      icon={iconName}
      width={width}
      height={height}
      color={color}
      className={className}
    />
  );
};

export default Index;