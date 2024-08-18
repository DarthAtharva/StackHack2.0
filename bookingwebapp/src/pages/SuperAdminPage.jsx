import { useState,useEffect } from "react";
import AccountNavigation from "./AccountNavigation";
import axios from "axios";
import {Link,Navigate, useParams} from "react-router-dom";


export default function SuperAdminPage(){
    const [users,setUsers] = useState([]);
    const [customers,setCustomers] = useState([]);
    const [admins,setAdmins] = useState([]);

    useEffect(() => {
        axios.get('/getAllUsers').then(({ data }) => {
            setUsers(data);
    
            // Separate arrays to hold customers and admins
            const customersList = [];
            const adminsList = [];
    
            data.forEach((it) => {
                if (it.role === 'customer') {
                    customersList.push(it);
                } else if (it.role === 'admin') {
                    adminsList.push(it);
                }
            });
    
            // Update state with the filtered arrays
            setCustomers(customersList);
            setAdmins(adminsList);
        }).catch(error => {
            console.error('Error fetching users:', error);
        });
    }, []);
    

   

    


    return(
        <div>
            <AccountNavigation/>

            <div className="grid grid-cols-2 ">

                <div className="mt-4 mr-2">
                    <label>Customers</label>
                    {customers.length > 0 && customers.map(it => (
                            <Link
                                key={it._id}
                                to = {'/account/superAdmin/'+ it._id} 
                                className="flex cursor-pointer gap-4 bg-gray-200 p-4">       
                                <h2 className="text-xl">
                                    User: {it.name} <br /> 
                                    Role: {it.role}<br/>
                                    Id: {it._id}
                                </h2>
                            </Link>
                        ))}
                </div>

                <div className="mt-4 ml-2">
                <label>Admins</label>
                    {admins.length > 0 && admins.map(it => (
                            <Link
                                key={it._id}
                                to = {'/account/superAdmin/'+ it._id} 
                                className="flex cursor-pointer gap-4 bg-gray-200 p-4">       
                                <h2 className="text-xl">
                                    User: {it.name} <br /> 
                                    Role: {it.role}
                                </h2>
                            </Link>
                        ))}
                </div>

            </div>
        </div>
    )

}