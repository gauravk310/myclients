# MyClients - Marketing Management Platform

A full-stack marketing management platform built with **Next.js** and **MongoDB**, designed to digitize offline client-visiting and follow-up workflows.

## 🚀 Features

### Authentication & Authorization
- User signup creates **Admin** accounts by default
- Role-based access control (Admin / Team Member)
- Secure password hashing with bcrypt
- JWT-based session management with NextAuth.js

### Dashboard
- **Admin Dashboard**: Overview with total clients, registered/non-registered counts, visit status statistics
- **Team Dashboard**: View assigned clients with date filters (defaults to today)
- Interactive stat cards for quick status filtering (Pending, Visited, Rescheduled)
- Real-time data refresh

### Client Management
- Create new clients with:
  - Name, Address, Map Location Link
  - Phone Number
  - Assigned Team Member
  - Visit Date
- Meeting status tracking: Pending, Visited, Rescheduled
- Client status: Registered / Not Registered
- Search and filter by date, status, and client status

### Client Detail & Visit History
- Complete client information display
- Timeline-based visit history
- Each visit record includes:
  - Site visit images
  - Contact persons collected (name & phone in table)
  - Feedback and issues noted
  - Rescheduled dates
  - Registration completion details
  - Payment screenshots
  - Document images

### Team Management (Admin Only)
- Create team members with name, email, password, and role
- Admin users have full platform access
- Team members see only their assigned clients
- Edit/delete team members

### Visit Recording
- Tabbed interface for recording visits:
  - **Visited**: Mark as visited, upload site images, collect contact persons
  - **Rescheduled**: Set new visit date
  - **Feedback/Issues**: Add notes and concerns
  - **Registration**: Mark registration complete, upload payment proof and documents

## 📁 Project Structure

```
myclients/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── signup/route.ts
│   │   │   ├── clients/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── visit/route.ts
│   │   │   ├── dashboard/stats/route.ts
│   │   │   ├── team/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── upload/route.ts
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── ToastProvider.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   └── mongodb.ts
│   ├── models/
│   │   ├── Client.ts
│   │   └── User.ts
│   ├── types/
│   │   └── next-auth.d.ts
│   └── middleware.ts
├── public/
│   └── uploads/    # Auto-created for file uploads
├── .env.local
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Credentials Provider
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myclients.git
   cd myclients
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/myclients

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000

   # JWT Secret
   JWT_SECRET=your-jwt-secret-key-change-this-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB Atlas connection string.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Default User Roles

### Admin
- Full access to all features
- Can create/edit/delete team members
- Can view all clients and their data
- Can assign clients to team members

### Team Member
- View only assigned clients
- Can create new clients (assigned to self)
- Can record visits and update client status
- Cannot access team management

## 📱 Usage Guide

### Getting Started

1. **Sign Up**: Create an account (automatically becomes Admin)
2. **Add Team Members**: Go to Team section and add your team
3. **Create Clients**: Add clients and assign to team members
4. **Track Visits**: Record visit outcomes with images and feedback

### Recording a Visit

1. Open a client's detail page
2. Click "Record Visit"
3. Use the tabbed interface:
   - **Visited**: Upload site images, add contact persons
   - **Reschedule**: Set a new visit date
   - **Feedback**: Add notes and issues
   - **Registration**: Mark as registered, upload proof

### Filtering Clients

- Use the date picker to filter by visit date
- Click status cards to filter by Pending/Visited/Rescheduled
- Use the search bar to find clients by name, address, or phone

## 🎨 Design Features

- **Dark Theme**: Modern dark glassmorphism design
- **Responsive**: Works on desktop and mobile devices
- **Animations**: Smooth transitions and micro-interactions
- **Status Badges**: Color-coded for quick visual reference
- **Timeline View**: Chronological visit history display

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Clients
- `GET /api/clients` - List clients (with filters)
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client
- `POST /api/clients/[id]/visit` - Add visit record

### Team (Admin Only)
- `GET /api/team` - List team members
- `POST /api/team` - Create team member
- `PUT /api/team/[id]` - Update team member
- `DELETE /api/team/[id]` - Delete team member

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Upload
- `POST /api/upload` - Upload file (images/documents)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with ❤️ using Next.js and MongoDB
