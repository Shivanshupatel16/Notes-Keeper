📝 NotesKeeper

A modern multi-user Notes App with workspace-based plan management, built with React, Redux, and Node.js (MERN stack).
Admins can manage users and plans, while users can create notes limited by their workspace plan.

🚀 Features

User & Workspace Management: Admins and members with role-based access.

Notes Management: Add, edit, delete notes. Free plan limited to 3 notes, Pro plan unlimited.

Plan Management: Upgrade individual users or entire workspace to Pro plan.

UI/UX: Modern Tailwind design, responsive, animations via Framer Motion.

Notifications: Success and error alerts via Sonner.

💻 Tech Stack

Frontend: React, Redux Toolkit, Tailwind CSS, Framer Motion

Backend: Node.js, Express, MongoDB, Mongoose

Authentication: JWT

HTTP Requests: Axios

⚡ Installation

# Clone repository
git clone https://github.com/yourusername/noteskeeper.git
cd notesapp

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

Create .env in server folder:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

Run the app:

# Backend
cd server
npm run dev

# Frontend
cd ../client
npm run dev

