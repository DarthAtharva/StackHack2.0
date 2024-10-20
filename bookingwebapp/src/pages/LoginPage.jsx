import axios from "axios";
import { UserContext } from "../UserContext.jsx";
import {Link, Navigate} from "react-router-dom"
import { useContext, useState } from "react";
import icon from "../assets/icon.png"

export default function LoginPage(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const {setUser} = useContext(UserContext);

    async function handleLoginSubmit(ev) {

        ev.preventDefault();

        try {
            const response = await axios.post('/login', { email, password });
    
            if (response.status === 200) {

                const userDocument = response.data;
                setUser(userDocument);
                alert('Login successful');
                setRedirect(true);

            } else {

                alert(response.data);

            }

        } catch (error) {

            if (error.response) {
              
                if (error.response.status === 401) {
                    alert('Incorrect password. Please try again.');
                } else if (error.response.status === 404) {
                    alert('Email not registered. Please check your email or sign up.');
                } else {
                    alert('Login failed. Please try again later.');
                }

            } else {

                alert('Login failed. Please try again later.');
                
            }
        }
    }

    async function handleGuestLogin(ev) {

        ev.preventDefault();

        try {
            const response = await axios.post('/login', { email:'guest@gmail.com', password:'guest' });
    
            if (response.status === 200) {

                const userDocument = response.data;
                setUser(userDocument);
                alert('Login Successful');
                setRedirect(true);

            } else {

                alert(response.data);

            }

        } catch (error) {

            if (error.response) {
              
                if (error.response.status === 401) {
                    alert('Incorrect password. Please try again.');
                } else if (error.response.status === 404) {
                    alert('Email not registered. Please check your email or sign up.');
                } else {
                    alert('Login failed. Please try again later.');
                }

            } else {

                alert('Login failed. Please try again later.');
                
            }
        }
    }

    if(redirect){

        return <Navigate to={'/'}/>

    }

    return(

        <section className="bg-gray-50 dark:bg-gray-900">

            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    <img className="w-8 h-8 mr-2" src={icon} alt="logo"/>
                    Mise-en-Movie
                </a>

                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">

                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>

                        <form className="space-y-4 md:space-y-6" onSubmit={handleLoginSubmit}>

                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="name@email.com" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-100 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required={true}
                                    value={email} 
                                    onChange={ev => setEmail(ev.target.value)}/>
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required={true}
                                    value={password} 
                                    onChange={ev => setPassword(ev.target.value)} />
                            </div>
                            
                            

                            <button 
                                type="submit" 
                                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>

                            <button 
                                onClick={handleGuestLogin}
                                type="submit" 
                                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Guest?</button>

                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don’t have an account yet? <Link 
                                    to={'/register'} 
                                    className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</Link>
                            </p>

                        </form>
                    </div>
                </div>
            </div>

            </section>

    );
    
}