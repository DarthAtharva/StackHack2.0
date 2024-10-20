import { useState, useEffect } from "react";
import AccountNavigation from "./AccountNavigation";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";

export default function TheatresFormPage() {

    const {id} = useParams();
    const [theatreName, setName] = useState('');
   
    const [rows, setRows] = useState('');
    const [cols, setCols] = useState('');
    const [city, setCity] = useState('');
    const [formFillError, setFormFillError] = useState({});

    const cities = ['Delhi','Jaipur','Bhopal','Pune','Ahmedabad','Kota','Mumbai']
    const [redirect,setRedirect] = useState(false);

    useEffect(() => {

        if(!id){ 
            return;
        }
        
        axios.get('/adminTheatres/' + id).then(response => {

            const {data} = response;
            setName(data.theatreName);
            setCity(data.city);
            setRows(data.rows);
            setCols(data.cols);

        });

    }, [id]);

    function validateForm() {

      const newErrors = {};

      if (!theatreName) newErrors.theatreName = 'Theatre name is required';
      if (!city) newErrors.city = 'City name is required';
      if (!rows || rows <= 0) newErrors.rows = 'Enter a valid number of rows';
      if (!cols || cols <= 0) newErrors.cols = 'Enter a valid number of columns';

      setFormFillError(newErrors);
      return Object.keys(newErrors).length === 0;
        
    }
    
    const handleCitySelect = (ev)=>{
        setCity(ev.target.value);
    };

  async function saveTheatre(ev) {
    ev.preventDefault();

    if (!validateForm()) {
      return;
    }

            const theatreData = {

                id,
                theatreName,
                city,
                rows,
                cols

            };

            if(id){

                /* update */

                try{
                    
                    console.log('Theatre successfully updated');

                    await axios.put('/adminTheatres', {
                        id, ...theatreData
                    });
                    
                    setRedirect(true);
                    alert('Theatre successfully updated');
        
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

  async function deleteTheatre() {
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
    return <Navigate to="/account/adminTheatres" />;
  }

  return (
    <div className="flex flex-col items-center mb-10">
      <AccountNavigation />

      <form className="min-w-[40rem] max-w-[60rem]" onSubmit={saveTheatre}>
        <h2 className="text-xl mt-6 mb-2">Theatre Name</h2>
        <input
          type="text"
          placeholder="Name of theatre"
          value={theatreName}
          onChange={(ev) => setName(ev.target.value)}
          className="border rounded p-2 mb-2 w-full"
        />
        {formFillError.theatreName && <div className="text-red-500">{formFillError.theatreName}</div>}

        <h2 className="text-xl mt-6 mb-2">Select a City</h2>
        <select
          value={city}
          className="w-full p-2 rounded-lg bg-transparent dark:bg-gray-800 dark:text-gray-300 overflow-hidden"
          onChange={handleCitySelect}
        >
          <option>Select a city</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {formFillError.city && <div style={{ color: 'red' }}>{formFillError.city}</div>}

        <h2 className="text-xl mt-6 mb-2">Rows</h2>
        <input
          type="number"
          placeholder="Rows in theatre"
          value={rows}
          onChange={(ev) => setRows(ev.target.value)}
          className="border rounded p-2 mb-2 w-full"
        />
        {formFillError.rows && <div style={{ color: 'red' }}>{formFillError.rows}</div>}

        <h2 className="text-xl mt-6 mb-2">Column</h2>
        <input
          type="number"
          placeholder="Columns in theatre"
          value={cols}
          onChange={(ev) => setCols(ev.target.value)}
          className="border rounded p-2 mb-2 w-full"
        />
        {formFillError.cols && <div style={{ color: 'red' }}>{formFillError.cols}</div>}

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
