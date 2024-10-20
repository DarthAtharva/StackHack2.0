import { useContext, useEffect, useState, useSyncExternalStore } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import MoviesPage from "./MoviesPage";
import AccountNavigation from "./AccountNavigation";

export default function AccountPage(){

    const {ready, user, setUser} = useContext(UserContext);
    const [redirect, setRedirect] = useState(null);
    const [request,setRequest] = useState('not sent');

    let { subpage } = useParams();

    if(subpage === undefined){
        subpage = 'profile';
    }


    async function adminRequest(id){

        try{
            console.log(id);
            await axios.post('/adminList/'+id);
            setRequest('sent');
        }catch(error){
            console.error({ error: 'Failed to send request' });
        }

       
    }

    async function logout(){

       

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

        <div>

            <AccountNavigation/>

            {subpage === 'profile' && (

                <div className="flex flex-col items-center max-w-lg mx-auto dark:text-primary-50">

                    <div className="font-light">

                        Logged in as {user.name} ({user.email}) <br/>
                        Current Role : {user.role}<br></br>

                        {user.role === 'customer' && request === 'not sent' && (<button onClick={() => adminRequest(user._id)} >change role to Admin</button>)} <br></br>
                        {request === 'sent' && "Your request to become admin is in process"}<br></br>
                        
                    </div>

                    <Link to={'/account/myBookings'}>
                    <button 
                        // onClick = {logout} 
                        className="min-w-32 bg-orange-400 rounded py-1 px-3 text-primary-50 mt-9">My Bookings</button>

                    </Link>
                    <button 
                        onClick = {logout} 
                        className="min-w-32 bg-orange-400 rounded py-1 px-3 text-primary-50 mt-4">Logout</button>


                </div>
            )}

            {subpage === 'adminMovies' && (

                <MoviesPage/>

            )}

        </div>

    );
}