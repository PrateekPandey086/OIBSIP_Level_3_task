# PizzaCraft - Artisan Pizza Delivery App 🍕

![PizzaCraft Banner](https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80)

> **Oasis Infobyte Internship - Web Development (Level 3 Task)**

PizzaCraft is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to provide a seamless and interactive pizza ordering experience. It features a custom pizza builder, real-time order tracking, secure payments, and a comprehensive admin dashboard for managing inventory and orders.

## 🌟 Features

### For Customers:
*   **Authentication:** Secure login and registration using JWT.
*   **Menu & Custom Builder:** Browse artisan pizzas or build your own with custom bases, sauces, cheeses, and toppings.
*   **Cart & Checkout:** Manage cart items, apply coupons, and checkout securely using **Razorpay**.
*   **Real-time Order Tracking:** Track the live status of your order (Received -> In Kitchen -> Baking -> Out for Delivery) powered by **Socket.io**.
*   **Order History & Wishlist:** View past orders, reorder favorites, and save pizzas to your wishlist.
*   **Responsive Design:** Beautiful, mobile-friendly UI built with Tailwind CSS and Framer Motion animations.

### For Administrators:
*   **Admin Dashboard:** Overview of sales, active orders, and revenue analytics.
*   **Real-time Order Management:** Receive instant notifications for new orders and update order statuses that reflect live on the customer's end.
*   **Inventory Management:** Track stock levels for ingredients. Automatic deduction upon order placement.
*   **Low Stock Alerts:** Real-time dashboard alerts and automated email notifications (via Nodemailer) when ingredient stock falls below a threshold.
*   **Menu Management:** Add, edit, or remove pizzas from the menu.
*   **Customer & Coupon Management:** View customer details and manage promotional coupons.

## 🛠️ Tech Stack

**Frontend:**
*   React.js (Vite)
*   Tailwind CSS (Styling)
*   Framer Motion (Animations)
*   React Router DOM (Navigation)
*   React Hook Form (Form Validation)
*   React Hot Toast (Notifications)
*   Socket.io-client (Real-time updates)
*   Razorpay Checkout (Payments)

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose (Database)
*   Socket.io (WebSockets)
*   JSON Web Tokens (JWT Authentication)
*   Bcrypt.js (Password Hashing)
*   Razorpay Node SDK (Payment Gateway)
*   Nodemailer (Email Notifications)
*   Cloudinary (Image Hosting)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16 or higher)
*   MongoDB (Local or Atlas)
*   Razorpay Account (for API keys)
*   Cloudinary Account (for image uploads)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PrateekPandey086/OIBSIP_Level_3_task.git
    cd OIBSIP_Level_3_task
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

### Environment Variables

Create a `.env` file in the `server` directory and add the following:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (SMTP for Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Seed Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Running the Application

1.  **Seed the Database (Optional but recommended to create the Admin user):**
    ```bash
    cd server
    npm run seed
    ```

2.  **Start the Backend Server:**
    ```bash
    cd server
    npm run dev
    ```

3.  **Start the Frontend Client:**
    ```bash
    cd client
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

## 👨‍💻 Author

**Prateek Pandey**
*   GitHub: [@PrateekPandey086](https://github.com/PrateekPandey086)

---
*This project was developed as part of the Oasis Infobyte Web Development Internship (Level 3).*
