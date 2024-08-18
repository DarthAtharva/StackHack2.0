import { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import MoviesPage from "./MoviesPage";
import AccountNavigation from "./AccountNavigation";
import { Button } from "flowbite-react";
import { ProfileCard } from "../components/ProfileCard";

export default function AccountPage(){

    const {ready, user, setUser} = useContext(UserContext);
    const [redirect, setRedirect] = useState(null);

    let { subpage } = useParams();

    if(subpage === undefined){
        subpage = 'profile';
    }

    async function logout(){

        // await axios.post('/logout', {}, { withCredentials: true });
        // // await axios.post('/logout');
        // setRedirect('/');
        // setUser(null);

        try {

            await axios.post('/logout', {}, { withCredentials: true });
            setRedirect('/');
            setUser(null);

        } catch (error) {

            console.error('Logout failed:', error);
            
        }

    }
    
    if(!ready){
        return 'Loading...';
    }
    
    if(ready && !user && !redirect){
        return <Navigate to ={'/login'} />
    }

    if(redirect){

        return <Navigate to = {redirect} />

    }

    return (

        <div className="bg-back h-screen">

            <AccountNavigation/>

            {subpage === 'profile' && (

                <div className="text-center max-w-lg mx-auto justify-center ">

                    {/* Logged in as {user.name} ({user.email})<br/> */}
                    <div className="flex justify-center"> 
                    <ProfileCard className="" userName = {user.name} userEmail = {user.email}></ProfileCard>

                    </div>
                    <Button onClick = {logout} className=" m-auto my-5 transition-transform p-2 w-96 duration-300 transform hover:scale-110"  color="dark" pill >Logout</Button>

                </div>
            )}

            {subpage === 'adminMovies' && (

                <MoviesPage/>

            )}

        </div>

    );
}