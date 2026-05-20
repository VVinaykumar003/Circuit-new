import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const widthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function CenteredContainer({
  children,
  maxWidth = "md",
}: Props) {
  return (
    <div className="w-full flex justify-center">
      <div
        className={`w-full ${widthMap[maxWidth]} 
        bg-base-100  
        p-6`}
      >
        {children}
      </div>
    </div>
  );
}
