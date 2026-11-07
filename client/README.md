MOE Kitui West Sub-County Data Management Portal

A full-stack web application designed for the Ministry of Education, Kitui West Sub-County, to streamline data collection, school registry management, and reporting. The system replaces manual data collection methods by providing a centralized platform for administrators and a dynamic, easy-to-use public form for schools to submit their data.

Features

Administrative Dashboard

· Live Statistics: Real-time overview of total registered schools, categorized by type (Public Primary, Private Primary, Secondary, Special), and total submissions received.
· Quick Navigation: Fast access to different registry sections and data collections.

School Registry

· Categorized Tabs: Manage schools efficiently through dedicated tabs for Public Primary, Private Primary, Secondary, and Special schools.
· Bulk Import: Upload Excel/CSV files to bulk-import school data, including UPN codes, zone, and Principal/HOI contact details.
· Manual Management: Add, edit, or delete individual school records.
· Search & Filter: Quickly find schools by name, code, or UPN.

Dynamic Data Collections (Form Builder)

· Custom Form Creation: Build forms dynamically by defining custom fields, grouping them (e.g., "Grade 1", "Grade 2"), and setting data types (Number, Text, Long Text).
· Auto-Calculation: Automatically calculates the sum of number fields within a specific group.
· Target Audience: Assign forms to specific school categories (e.g., Primary Only, Secondary Only, All Schools), which automatically filters the schools available in the public dropdown.
· Public Links: Generate unique, shareable links for schools to access and fill out the forms without requiring a login.
· Live Updates: The admin view automatically refreshes to show new submissions in real-time.

Public Submission Portal (Schools)

· Searchable Dropdown: Schools can easily find their name by typing, which filters based on the form's target audience.
· Smart Pre-filling: If a school has already submitted data for a form, selecting their name will pre-fill the form with their previous answers, allowing them to easily make corrections and updates.
· Live Form Status: The form automatically reflects if the admin has closed it.

Data Export

· Export submissions to a formatted Excel (.xlsx) file.
· Columns are dynamically generated and grouped (e.g., "Grade 1 - Total Boys") to prevent confusion.
· Auto-calculated totals are included in the export.

Technology Stack

· Frontend: React (Vite), Tailwind CSS, React Router
· Backend: Node.js, Express.js
· Database: MongoDB (via Mongoose)
· Authentication: JSON Web Tokens (JWT) with bcrypt password hashing
· File Parsing: xlsx for Excel/CSV imports and exports
· Hosting: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

Project Structure

```text
moe-kitui-west/
├── server/                 # Backend API
│   ├── middleware/         # Auth guards
│   ├── models/             # Mongoose schemas (School, User, Collection, Submission)
│   ├── routes/             # API endpoints (auth, schools, collections, submissions, exports)
│   ├── seed/               # Initial database seeding scripts
│   ├── index.js            # Server entry point
│   └── package.json
└── client/                 # Frontend React Application
    ├── src/
    │   ├── api/            # Axios configuration
    │   ├── components/     # Reusable UI components (Header, Footer, Layout)
    │   ├── pages/          # Application views (Login, Dashboard, Schools, Collections, Submissions, PublicForm)
    │   ├── App.jsx         # React Router setup
    │   └── main.jsx
    └── package.json
```

Local Development Setup

Prerequisites

· Node.js (v18+)
· MongoDB (Local instance or MongoDB Atlas URI)
· Git

1. Clone the repository

```bash
git clone https://github.com/jacobkau/MOE-Kitui-West.git
cd MOE-Kitui-West
```

2. Backend Setup

```bash
cd server
npm install
```

Create a .env file in the server directory and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
ADMIN_USERNAME= your_admin_username
ADMIN_PASSWORD=your_secure_password
CLIENT_ORIGIN=http://localhost:5173
```

Seed the initial admin account:

```bash
npm run seed:admin
```

Start the backend development server:

```bash
npm run dev
```

3. Frontend Setup

Open a new terminal window:

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application will be accessible at http://localhost:5173.

Deployment

Backend (Render)

1. Create a new Web Service on Render and link your GitHub repository.
2. Set the Root Directory to server.
3. Set the Build Command to npm install.
4. Set the Start Command to npm start.
5. Add the environment variables (MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, CLIENT_ORIGIN) in the Render dashboard.

Frontend (Vercel)

1. Import the GitHub repository into Vercel.
2. Set the Framework Preset to Vite.
3. Set the Root Directory to client.
4. Update the baseURL in client/src/api/axios.js to point to your live Render backend URL.
5. Deploy.

Author

Developed by Jacob Kau for the Ministry of Education, Kitui West Sub-County.