import { Container } from "@mui/material";
import React from "react";
import MainNavigation from "./MainNavigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container className="h-full">
      <div className="flex container h-full mx-auto">
        <div className="w-[20%] h-full bg-green-200">
          <MainNavigation />
        </div>
        {children}
      </div>
    </Container>
  );
};

export default MainLayout;
