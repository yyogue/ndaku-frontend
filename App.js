import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import NavBar from "./src/components/NavBar/NavBar";
import Home from "./src/components/Home/Home";
import ForRent from "./src/Pages/ForRent/ForRent";
import ForSale from "./src/Pages/ForSale/ForSale";
import ContactUs from "./src/Pages/ContactUs/ContactUs";
import FAQ from "./src/Pages/FAQ/FAQ";
import AboutUs from "./src/Pages/AboutUs/AboutUs";
import Login from "./src/Pages/Login/Login";
import Signup from "./src/Pages/Signup/Signup";
import DashboardLayout from "./src/components/DashboardLayout/DashboardLayout";
import UpdateListing from "./src/components/UpdateListing/UpdateListing";
import ListingDetail from "./src/components/ListingDetail/ListingDetail";
import Search from "./src/components/Search/Search";
import SearchResults from "./src/components/Search/SearchResults";

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
        <Route path="/list-property" element={<DashboardLayout />} />
        <Route path="/update-listing/:id" element={<UpdateListing />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/search-results" element={<SearchResultsWrapper />} />
        <Route path="/" exact element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const SearchResultsWrapper = () => {
  const location = useLocation();
  const results = location.state?.results || [];
  return <SearchResults results={results} />;
};

export default App;
