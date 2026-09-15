# RentAero - A Role-Agnostic Rental Management Platform

"Rent Sports & Outdoor Gear Instantly"

RentAero is a robust, scalable, and fully role-agnostic rental management platform designed to allow users to seamlessly rent, manage, and review gear. Built with modern backend technologies, it features a standardized RESTful API architecture, secure payment integration, and comprehensive data handling.

---

## 🚀 Key Features

* **Role-Based User Management**: Support for **Customer**, **Provider**, and **Admin** roles selected during registration.
* **Public Discovery**: Browse all available sports & outdoor gear with advanced search and filters (category, price, brand, and availability).
* **Rental Lifecycle**: End-to-end rental order processing from placement to confirmation, pick-up, and return.
* **Flexible Payments**: Secure payment processing via **Stripe** or **SSLCommerz** during order placement and confirmation.
* **Provider Inventory Control**: Full CRUD capabilities for providers to manage gear inventory, stock, and incoming orders.
* **Strict Review System**: Customers can leave reviews and ratings for gear items strictly after the equipment is returned.
* **Admin Moderation**: Comprehensive administrative tools to manage user statuses (suspend/activate), monitor all gear listings, and oversee platform rentals and categories.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js & TypeScript
* **Framework**: Express.js
* **Database & ORM**: Postgres / Prisma 
* **Payment Gateway**: Stripe API
* **Deployment**: Vercel Serverless

---

## 📊 Rental Order Status Flow

1. **`PLACED`**: Order is created by the customer.
2. **`CONFIRMED` / `CANCELLED`**: Provider confirms the order or customer cancels it.
3. **`PAID`**: Payment successfully processed via Stripe or SSLCommerz.
4. **`PICKED_UP`**: Customer picks up the gear.
5. **`RETURNED`**: Gear is returned (enables review creation).

---

## ⚙️ Setup & Installation Guide

Follow these steps to set up and run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/mehrajhr/Rent-Aero.git]
cd Rent-Aero
```

### 2. Install Dependencies

npm install

### 3. Configure Environment Variables

Replace .env.example of this project 

### 4. Run the Development Server

npm run dev


## 📄 API Documentation

The complete Postman Collection is included in this repository for testing and reviewing all RESTful endpoints.

* **Collection File**: You can find the raw JSON file in the root directory: [`rent-aero.postman_collection.json`](./rent-aero.postman_collection.json)
* **How to Use**:
  1. Download or clone this repository.
  2. Open **Postman**.
  3. Click on **Import** and select the `rent-aero.postman_collection.json` file.
  4. Set up your environment variables (e.g., `baseUrl`) to test local or production endpoints seamlessly.