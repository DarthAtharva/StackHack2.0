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
