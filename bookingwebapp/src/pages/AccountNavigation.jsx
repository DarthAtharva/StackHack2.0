import { Link, useLocation } from "react-router-dom";

export default function AccountNavigation(){

    const {pathname} =  useLocation();
    let subpage = pathname.split('/')?.[2];
    if(subpage === undefined){
        subpage = 'profile';
    }

    const linkClasses = (page) => {
        
        return page === subpage ? 'inline-flex gap-1 bg-primary text-white rounded-full px-6 py-2' : 'inline-flex gap-1 rounded-full border-2 px-6 py-2';

    };

    return(
        <div class="relative flex  flex-col items-center justify-center overflow-hidden bg-back py-6 sm:py-12">
        <nav className=" max-w-screen-xl mx-12 z-10">
          <div class="flex justify-center gap-5 p-5">
            <Link className="relative border-2 border-gray-800 bg-transparent py-2.5 px-5 font-medium uppercase text-gray-800 transition-colors before:absolute before:left-0 before:top-0 before:-z-10 before:h-full before:w-full before:origin-top-left before:scale-x-0 before:bg-gray-800 before:transition-transform before:duration-300 before:content-[''] hover:text-white before:hover:scale-x-100" to={'/account'}>My Account</Link>
            <Link className="relative border-2 border-gray-800 bg-transparent py-2.5 px-5 font-medium uppercase text-gray-800 transition-colors before:absolute before:left-0 before:top-0 before:-z-10 before:h-full before:w-full before:origin-top-left before:scale-x-0 before:bg-gray-800 before:transition-transform before:duration-300 before:content-[''] hover:text-white before:hover:scale-x-100 " to={'/account/adminMovies'}>My Movies</Link>
            <Link className="relative border-2 border-gray-800 bg-transparent py-2.5 px-5 font-medium uppercase text-gray-800 transition-colors before:absolute before:left-0 before:top-0 before:-z-10 before:h-full before:w-full before:origin-top-left before:scale-x-0 before:bg-gray-800 before:transition-transform before:duration-300 before:content-[''] hover:text-white before:hover:scale-x-100" to={'/account/adminTheatres'}>My Theatres</Link>
            <Link className="relative border-2 border-gray-800 bg-transparent py-2.5 px-5 font-medium uppercase text-gray-800 transition-colors before:absolute before:left-0 before:top-0 before:-z-10 before:h-full before:w-full before:origin-top-left before:scale-x-0 before:bg-gray-800 before:transition-transform before:duration-300 before:content-[''] hover:text-white before:hover:scale-x-100" to={'/account/adminShowtimes'}>My Showtimes</Link>
          </div>
        </nav>
        </div>
    );
}