import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Updated import
import NavBar from "./src/components/NavBar/NavBar";
import Home from "./src/components/Home/Home";
import ForRent from "./src/Pages/ForRent/ForRent";
import ForSale from "./src/Pages/ForSale/ForSale";
import ContactUs from "./src/Pages/ContactUs/ContactUs";
import FAQ from "./src/Pages/FAQ/FAQ";
import AboutUs from "./src/Pages/AboutUs/AboutUs";
import Login from "./src/Pages/Login/Login"
import Signup from "./src/Pages/Signup/Signup";

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/for-rent" element={<ForRent />} />
        <Route path="/for-sale" element={<ForSale />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/" exact element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
