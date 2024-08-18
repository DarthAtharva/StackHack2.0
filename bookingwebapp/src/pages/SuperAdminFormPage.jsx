import { useState,useEffect } from "react";
import AccountNavigation from "./AccountNavigation";
import axios from "axios";
import {Navigate, useParams} from "react-router-dom";

export default function SuperAdminFormPage(){

    const {id} = useParams();
    const [name,setName] = useState([]);
    const [role,setRole] = useState([]);
    const [email,setEmail] = useState([]);
    const [errors, setErrors] = useState({});
    const [redirect,setRedirect] = useState(false);
    useEffect(() => {

        if(!id){ 
            return;
        }
        
        //chjange path to get user by id
        axios.get('/getUser/'+id).then(response => {

            const {data} = response;
            setName(data.name);
            setRole(data.role);
            setEmail(data.email);
            

        });

    }, [id]);

    function validateForm() {
        const newErrors = {};
        if (!role) newErrors.role = 'role is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // const handleRoleSelect = (ev)=>{
    //     setRole(ev.target.value);
    // };
    const toggleRole = () => {
        const newRole = role === 'admin' ? 'customer' : 'admin';
        
        // Update role in state
        setRole(newRole);
    }
    async function saveUser(ev){

        ev.preventDefault(); 

        if (!validateForm()) {
            return;
        }


            const userData = {
                
                name,
                email,
                role

            };

            if(id){

                /* update */

                try{
                    
                    console.log('User Successfully updated');

                    await axios.put('/updateUser/'+id, {
                        ...userData
                    });
                    
                    setRedirect(true);
                    alert('User Successfully updated');
        
                }catch(error){
        
                    console.error('Error updating User:', error);
                    alert('Failed to upate this User');
        
                }

            }
        
    }

    if (redirect) {
        return <Navigate to='/account/superAdmin' />;
    }


    return(
        <div>
            <AccountNavigation/>

            <form onSubmit={saveUser}>
            <h2 className="text-xl mt-2">User Name : {name}</h2>
            <button onClick={toggleRole} key={role} value={role} >
                Switch to {role === 'admin' ? 'Customer' : 'Admin'}
            </button>
            {/* <label 
                    className="text-xl mt-2"
                    >Role : </label> */}
            {/* <select onChange={handleRoleSelect}
                    className={`border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`} 
                    >         
                        <option key={role} value={role}>
                                    admin
                                </option>  
                        <option key={role} value={role}>
                                    customer
                                </option> 


                    </select> */}

                <div className="flex gap-4 mt-4">
                    <button type="submit" className="bg-gray-100 py-2 px-4 rounded-lg">
                        Submit
                    </button>

                </div>        
                  
            </form>
        </div>
    )
}