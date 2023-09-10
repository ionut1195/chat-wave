import { Container } from "@mui/material";
import React from "react";
import MainNavigation from "./MainNavigation";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <div className="flex container mx-auto">
        <div className="w-[20%] bg-green-200">
          <MainNavigation />
        </div>
        {children}
      </div>
    </Container>
  );
};

export default MainLayout;
