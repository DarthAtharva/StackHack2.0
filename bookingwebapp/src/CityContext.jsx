import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const CityContext = createContext({});

export function CityContextProvider({children}){

    const [city, setCity] = useState(null);
    const [ready,setReady] = useState(false);

    // useEffect(() => {

        
    //     try{
    //         axios.get('/profile').then(({ data }) => {
    
    //             setCity(data.city || null); 
    //             setReady(true);
                
    //         });
    //     }catch(error){
    //         setCity(null);
    //     }

    // }, []);

    return(

        <CityContext.Provider value = {{city, setCity, ready}}>
            {children}
        </CityContext.Provider>

    );

}