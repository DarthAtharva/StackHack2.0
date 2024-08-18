import { useState,useEffect } from "react";
import AccountNavigation from "./AccountNavigation";
import axios from "axios";
import {Navigate, useParams} from "react-router-dom";


export default function TheatresFormPage() {

    const {id} = useParams();
    const [theatreName, setName] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [rows, setRows] = useState('');
    const [cols, setCols] = useState('');
    const [city, setCity] = useState('');
    const [errors, setErrors] = useState({});

    const cities = ['Delhi','Jaipur','Bhopal','Pune','Ahmedabad','Kota','Mumbai']
    const [redirect,setRedirect] = useState(false);

    useEffect(() => {

        if(!id){ 
            return;
        }
        
        axios.get('/adminTheatres/' + id).then(response => {

            const {data} = response;
            setName(data.theatreName);
            setTicketPrice(data.ticketPrice);
            setCity(data.city);
            setRows(data.rows);
            setCols(data.cols);

        });

    }, [id]);

    function validateForm() {
        const newErrors = {};
        if (!theatreName) newErrors.theatreName = 'Theatre name is required';
        if (!ticketPrice) newErrors.ticketPrice = 'TicketPrice name is required';
        if (!city || city == 'Select a city') newErrors.city = 'City name is required';
        if (!rows || rows === '') newErrors.rows = 'Rows is required';
        if (!cols || cols === '') newErrors.cols = 'Cols is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    
    const handleCitySelect = (ev)=>{
        setCity(ev.target.value);
    };

    async function savetheatre(ev){

        ev.preventDefault(); 

        if (!validateForm()) {
            return;
        }


            const theatreData = {

                id,
                theatreName,
                city,
                ticketPrice,
                rows,
                cols

            };

            if(id){

                /* update */

                try{
                    
                    console.log('theatre Successfully updated');

                    await axios.put('/adminTheatres', {
                        id, ...theatreData
                    });
                    
                    setRedirect(true);
                    alert('theatre Successfully updated');
        
                }catch(error){
        
                    console.error('Error updating theatre:', error);
                    alert('Failed to upate this theatre');
        
                }

            }else{

                /* new */

                try{

                    await axios.post('/adminTheatres', theatreData);
        
                    setRedirect(true);
                    alert('theatre Successfully added');
        
                }catch(error){
        
                    console.error('Error adding new theatre:', error);
                    alert('Failed to add new theatre');
        
                }

            }
        
    }

    async function deleteTheatre(){
        if (window.confirm("Are you sure you want to delete this theatre?")) {
            try {
              await axios.delete(`/adminTheatres/${id}`);
              setRedirect(true);
              alert("Theatre successfully deleted");
            } catch (error) {
              console.error("Error deleting theatre:", error);
              alert("Failed to delete the theatre");
            }
          }
    }
    
    if (redirect) {
        return <Navigate to='/account/adminTheatres' />;
    }

    return (

        <div>

            <AccountNavigation/>
            

            <form onSubmit={savetheatre}>

                

                <h2 className="text-xl mt-2">Theatre Name</h2>
                <input 
                    type="text" 
                    // id="theatre-name"
                    // name="name" 
                    placeholder="Name of theatre" 
                    value={theatreName} 
                    onChange={ev => setName(ev.target.value)} 
                    // required 
                />
                {errors.theatreName && <div style={{ color: 'red' }}>{errors.theatreName}</div>}
                
                {/* <h2 className="text-xl mt-2">City Name</h2>
                <input 
                    type="text" 
                    // id="theatre-name"
                    // name="name" 
                    placeholder="Name of city" 
                    value={city} 
                    onChange={ev => setCity(ev.target.value)} 
                    // required 
                />
                {errors.city && <div style={{ color: 'red' }}>{errors.city}</div>} */}


                <label 
                    className="text-xl mt-2"
                    >Select a City</label>
                    <select onChange={handleCitySelect}
                    className={`border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2 px-4 w-full`} 
                    >
                        <option>Select a city</option>
                        {cities.map(city => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                        ))};
                    </select>
                    {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}


                <h2 className="text-xl mt-2">Ticket price</h2>
                <input 
                    type="number" 
                    // id="theatre-name"
                    // name="name" 
                    placeholder="Price of ticket" 
                    value={ticketPrice} 
                    onChange={ev => setTicketPrice(ev.target.value)} 
                    // required 
                />
                {errors.ticketPrice && <div style={{ color: 'red' }}>{errors.ticketPrice}</div>}

                <h2 className="text-xl mt-2">Rows</h2>
                <input 
                    type="number" 
                    // id="theatre-name"
                    // name="name" 
                    placeholder="Rows in theatre" 
                    value={rows} 
                    onChange={ev => setRows(ev.target.value)} 
                    // required 
                />
                {errors.rows && <div style={{ color: 'red' }}>{errors.rows}</div>}

                <h2 className="text-xl mt-2">Cols</h2>
                <input 
                    type="number" 
                    // id="theatre-name"
                    // name="name" 
                    placeholder="Cols in theatre" 
                    value={cols} 
                    onChange={ev => setCols(ev.target.value)} 
                    // required 
                />
                {errors.cols && <div style={{ color: 'red' }}>{errors.cols}</div>}



                
            
                <div className="flex gap-4 mt-4">
                    <button type="submit" className="bg-gray-100 py-2 px-4 rounded-lg">
                        Submit
                    </button>

                    {id && (
                        <button
                        type="button"
                        onClick={deleteTheatre}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg"
                        >
                        Delete
                        </button>
                    )}
                </div>

            </form>

        </div>
    );

}