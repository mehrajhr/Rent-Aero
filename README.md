# RentAero - A Role-Agnostic Rental Management Platform

RentAero is a robust, scalable, and fully role-agnostic rental management platform designed to allow users to seamlessly rent, manage, and review gear. Built with modern backend technologies, it features a standardized RESTful API architecture, secure payment integration, and comprehensive data handling.

---

## 🚀 Key Features

* **Role-Agnostic User System**: Flexible architecture where any registered user can act as a customer, provider, or administrator to manage and rent gear.
* **Advanced Gear Filtering & Search**: Robust query filtering, search capabilities, category organization, and price filtering for seamless gear discovery.
* **Secure Authentication & Management**: JWT-based authentication featuring user registration, secure login, token refreshing, and full profile management alongside admin controls for user status.
* **Rental Orders Management**: End-to-end order lifecycle handling, tracking customer rentals, order details, and administrative overview of all platform transactions.
* **Stripe Payment Integration**: Secure checkout session generation and dedicated payment history and details tracking.
* **Strict Review & Validation System**: Comprehensive review mechanisms with composite unique constraints to prevent duplicates, restricted strictly to orders marked with a `RETURNED` status.
* **Standardized REST API**: Consistent success and error response formats across all modules for predictable client integration.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js & TypeScript
* **Framework**: Express.js
* **Database & ORM**: MongoDB / Prisma (or Mongoose)
* **Payment Gateway**: Stripe API
* **Deployment**: Vercel Serverless

---

## ⚙️ Setup & Installation Guide

Follow these steps to set up and run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/mehrajhr/Rent-Aero.git]

### 2. Install Dependencies

npm install

### 3. Configure Environment Variables

Replace .env.example of this project 

### 4. Run the Development Server

npm run dev
