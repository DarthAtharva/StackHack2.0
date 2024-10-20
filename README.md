# Mise-en-Movie

## Overview

**Mise-en-Movie** is a full-stack movie booking website where users can book movies listed by admins. The website supports multiple user roles, including Admin, Super Admin, and Customer, each with different levels of access and control. Admins can list movies, theaters, and create showtimes, while customers can browse available movies and book tickets. Super Admins can manage user roles.

## Features

- **User Authentication**: Secure login and signup functionality for different user roles.
- **Seat Booking**: Customers can select seats and book them for a particular showtime.
- **Payment Gateway Integration**: Simulated payment gateway for ticket booking.
- **Admin Dashboard**: Admins can manage movies, theaters, and showtimes (All CRUD Operations)
- **Super Admin Controls**: Manage user roles and approve or decline admin requests.
- **Movie and Showtime Listings**: Browse available movies and showtimes.
  
## Technologies Used

### Frontend

- React
- TailwindCSS

### Backend

- Node.js
- Express

### Database

- MongoDB

## Roles

- **Customer**: Can browse and book available movies and showtimes.
- **Admin**: Can perform CRUD operations for movies, theaters, and showtimes.
- **Super Admin**: Can update any user's role from customer to admin and vice versa.

## Installation and Setup

### Prerequisites

Ensure you have the following installed:

- Node.js 
- npm 

### Steps to Install


1. **Install dependencies for the backend:**
   ```bash
   cd ./api
   npm install
   ```

2. **Install dependencies for the frontend:**
   ```bash
   cd ./bookingwebapp
   npm install
   ```

### Environment Variables

Set up the following environment variables for the project:

#### For Backend (`api`):

```plaintext
PORT=4000
MONGO_URL=mongodb+srv://22ucs038:22ucs038@cluster0.lbamc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=wewillwinthishackathon
EMAIL_PASS='aiwg jecg lzpx gcno'
EMAIL=ysharmaa09@gmail.com
FRONTEND_URL=http://localhost:5173
```

#### For Frontend (`bookingwebapp`):

```plaintext
VITE_BASE_URL=http://localhost:4000
```

## Usage

### Running the Application

- **Frontend**:
  ```bash
  cd ./bookingwebapp
  npm run dev
  ```
- **Backend**:
 ```bash
  cd ./api
  nodemon index.js
  ```
  OR

  ```bash
  cd ./api
  node index.js
  ```

### Example Usage

#### As Super Admin:

1. **Login**: Use the "Sign In" button and enter credentials:
   - Email: `superAdmin@gmail.com`
   - Password: `c`
   
2. **Manage Users**: Access the "Super Admin" option to manage user roles.

#### As Admin:

1. **Login**: Use the "Sign In" button and select "Guest?" for quick access.
   
2. **Admin Dashboard**: Access options like "My Movies," "My Theatres," and "My Showtimes" to manage content.

#### As Customer:

1. **Login**: Use the "Sign In" button or create a new account using "Sign Up."
   
2. **Book Tickets**: Browse movies, select city and date, choose available showtimes, and proceed to booking.

#### Common Actions for All Roles:

- **View Movie Details**: Click on any movie to see its description and book tickets.
- **Book a Showtime**: Select a showtime, choose seats, and proceed to payment.
- **Dummy Payment**: Enter any value for "Card Number," "Expiry Date," and "CVV" to simulate payment. You must be logged in to book a ticket.

## Testing the  customer Feature:
Step1:Click on Mise-en-Movie logo on the top left to go to the main page.
Step2:Click on movie named "Bliss" and on the next page click on book.
Step3:Choose Date "30 sept" and city "Jaipur".
Step4:Choose the showtime available that day and you will open a seat selector in which you can select seats and pay for them using dummy payment gateway.
Step5: Fill any random details in the dummy payment and click "Pay Now" button.
Step6: Go to "My Bookings" to find your tickets.
