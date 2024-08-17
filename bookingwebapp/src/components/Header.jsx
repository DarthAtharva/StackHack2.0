import { Link } from 'react-router-dom';
import {useContext} from "react";

import CitySelector from './CitySelector'
import {UserContext} from "../UserContext"

import SearchPage from '../pages/SearchPage';

export default function Header(){

    const {user} = useContext(UserContext);

    return(

        <header className="flex justify-between gap-4 bg-back">

                {/* LOGO */}
                <Link to = {'/'} href="" className="flex gap-1 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                    </svg>
                    <span className="font-bold text-black hover:text-black hover:text-2xl transition-all duration-500">StackHack</span>
                </Link>

                {/* Search Menu */}
                <SearchPage/>

                <div className="text-black">
                    <CitySelector />
                </div>

                {/* Profile Icon */}
                <Link to = {user? '/account' : '/login'} className="flex items-center">

                    {user ? (
                        <span className="mr-2">{user.name}</span>
                    ) : (
                        <span className= "text-black transition-underline duration-300 hover:underline">Sign In</span>
                    )}

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>

                </Link>

                {/* Hamburger */}
                <div className="flex items-center">

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>

                </div>

            </header>

    );
}