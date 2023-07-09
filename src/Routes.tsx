import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const Home = lazy(async () => await import("./Pages/Home/Home.tsx"));

const Reader = lazy(async () => await import("./Pages/Reader/Reader.tsx"));

function RoutesWrapper() {
  return (
    <Suspense fallback={"..."}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reader" element={<Reader />} />
      </Routes>
    </Suspense>
  );
}

export default RoutesWrapper;
