import React, { useState, useContext } from "react";
import axios from "axios"; 
import { UserContext } from "../UserContext"; 

export default function SupportComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user } = useContext(UserContext); 

  // Function to handle form submission and send email
  const sendQuery = async (e) => {
    e.preventDefault();

  
    if (!user) {
      alert("Please log in first to send a query.");
      return;
    }

    setIsSending(true);

    try {
      // Sending query along with user information
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/send-email`, {
        query,
        userEmail: user.email, 
        userName: user.name, 
      });
      alert(response.data);
      setQuery(""); 
      setIsOpen(false); 
    } catch (error) {
      console.error("Failed to send query", error);
      alert("Failed to send query. Please try again.");
    } finally {
      setIsSending(false); // Reset sending state
    }
  };

  return (
    <>
      
      <button
        className={`fixed bottom-5 right-5 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-500 transition-transform duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
        onClick={() => setIsOpen(true)}
      >
        Support
      </button>

      
      <div
        className={`fixed bottom-5 right-5 bg-white p-6 rounded shadow-lg max-w-sm w-full transform transition-all duration-500 ease-in-out ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-90"
        }`}
        style={{ display: isOpen ? "block" : "none" }}
      >
        <h2 className="text-lg font-bold mb-4">Send Query</h2>
        <form onSubmit={sendQuery}>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            placeholder="Write your query here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            rows="4"
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400 transition duration-200"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-500 transition duration-200 ${
                isSending ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
