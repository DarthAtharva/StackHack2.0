import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Layout(){

    return(

        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">

            <Header/>
            <Outlet/>
            <Footer/>
        </div>

    );
}