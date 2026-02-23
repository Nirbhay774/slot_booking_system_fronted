# Slot Booking System - Frontend 📅

A modern, responsive frontend for the Slot Booking System, built with **Next.js 15**, **React 19**, and **Tailwind CSS 4**. This application allows users to manage their availability, create booking links, and handle appointments seamlessly.

## 🚀 Features

- **Authentication**: Secure login and registration using JWT.
- **Dashboard**: Overview of scheduled meetings and availability events.
- **Availability Management**: Set up custom time slots for different days.
- **Booking Flow**: Publicly accessible booking pages for clients.
- **Modern UI**: Polished interface with Lucide icons and professional components.
- **Form Validation**: Robust client-side validation using React Hook Form and Zod.

## 🛠️ tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **API Client**: Axios

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root with your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # Reusable UI & Feature components
├── context/        # React Context for State Management
├── hooks/          # Custom React Hooks
├── lib/            # Utility functions & API configuration
└── lib/api/        # Axios API service layers
```
