import { useState } from "react";
import {Link, Navigate} from "react-router-dom";
import axios from "axios";

export default function RegisterPage(){

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [redirectToLogin, setRedirectToLogin] = useState(false);

    async function registerUser (ev){

        ev.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try{

            await axios.post('/register', {
                name,
                email,
                password,
            });
    
            setRedirectToLogin(true);
            alert('You have been registered');

        }catch(duplicateMailError){

            alert('This mail has already been registered');

        }

    }

    if(redirectToLogin){
        return <Navigate to='/login' />;
    }

    return(

       

        <section class="bg-gray-50 dark:bg-gray-900">

            <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

                <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
                    Mise-en-Movie
                </a>

                <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">

                        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Register a New Account
                        </h1>

                        <form class="space-y-4 md:space-y-6" onSubmit={registerUser}>

                            <div>
                                <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    id="name" 
                                    placeholder="Enter a name" 
                                    class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-100 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required="true"
                                    value={name} 
                                    onChange={ev => setName(ev.target.value)}/>
                            </div>

                            <div>
                                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="name@email.com" 
                                    class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-100 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required="true"
                                    value={email} 
                                    onChange={ev => setEmail(ev.target.value)}/>
                            </div>

                            <div className="flex gap-2">
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        id="password" 
                                        placeholder="Password" 
                                        class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-100 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                        required="true"
                                        value={password} 
                                        onChange={ev => setPassword(ev.target.value)}/>
                                </div>

                                <div>
                                    <label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        id="confirmPassword" 
                                        placeholder="Confirm Password" 
                                        class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-100 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                        required="true"
                                        value={confirmPassword} 
                                        onChange={ev => setConfirmPassword(ev.target.value)}/>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Register</button>

                            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                                Already registered? <Link 
                                    to={'/login'} 
                                    class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign in</Link>
                            </p>

                        </form>
                    </div>
                </div>
            </div>

            </section>
        
    );
    
}