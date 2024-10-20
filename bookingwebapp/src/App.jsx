import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IndexPage from "./pages/IndexPage"
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./layout";
import './App.css'

import axios from "axios";

import { UserContextProvider } from "./UserContext";
// import { CityContextProvider } from "./CityContext";

import AccountPage from "./pages/AccountPage";
import MoviesPage from "./pages/MoviesPage";
import MoviesFormPage from "./pages/MoviesFormPage";
import TheatrePage from "./pages/TheatrePage";
import TheatresFormPage from "./pages/TheatresFormPage";
import ShowtimesPage from "./pages/ShowtimesPage";
import ShowtimesFormPage from "./pages/ShowtimeFormPage"
import SuperAdminPage from "./pages/SuperAdminPage"
// import SuperAdminFormPage from "./pages/SuperAdminFormPage"
import MyBookings from "./pages/MyBookings";
import MoviePage from "./pages/MoviePage";
import ReservationFormPage from "./pages/ReservationFormPage";

import SupportComponent from "./components/SupportComponent";
export default function App() {

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  axios.defaults.withCredentials = true;

  return (
    
    <UserContextProvider>
      {/* <CityContextProvider> */}

        <Router>
          <Routes>
            <Route path = "/" element ={<Layout/>}>
            
              <Route path = "/" element={<IndexPage />} />
              <Route path = "/login" element = {<LoginPage />} />
              <Route path = "/register" element = {<RegisterPage />} />
              <Route path = "/account" element = {<AccountPage />} />

              <Route path = "/account/adminMovies" element = {<MoviesPage />} />
              <Route path = "/account/adminMovies/new" element = {<MoviesFormPage />} />
              <Route path = "/account/adminMovies/:id" element = {<MoviesFormPage />} />

              <Route path = "/movie/:id" element = {<MoviePage />} />
              <Route path = "/movie/book/:id" element = {<ReservationFormPage />} />

              <Route path = "/account/adminTheatres" element = {<TheatrePage />} />
              <Route path = "/account/adminTheatres/new" element = {<TheatresFormPage />} />
              <Route path = "/account/adminTheatres/:id" element = {<TheatresFormPage />} />

            <Route path = "/account/adminShowtimes" element = {<ShowtimesPage />} />
            <Route path = "/account/adminShowtimes/new" element = {<ShowtimesFormPage />} />
            <Route path = "/account/adminShowtimes/:id" element = {<ShowtimesFormPage />} />

            <Route path = "/account/superAdmin" element = {<SuperAdminPage />} />

            <Route path = "/account/myBookings" element = {<MyBookings />} />



          </Route>
        </Routes>
        <SupportComponent />
      </Router>

      {/* </CityContextProvider> */}
    </UserContextProvider>
    
  );
}
