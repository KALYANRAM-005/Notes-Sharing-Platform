# Notes Sharing Platform

A comprehensive web-based platform designed for students to share and access academic notes. This platform enables students to upload, download, rate, and review notes organized by courses and semesters.

## Project Structure

```
notes-sharing-platform/
├── node_modules/          # NPM dependencies
├── public/                # Static frontend files (HTML, CSS, JS)
├── uploads/               # Uploaded notes storage directory
├── db.js                  # Database connection and configuration
├── server.js              # Main Express server file
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Dependency lock file
├── tempCodeRunnerFile.js  # Temporary execution file
└── README.md
```

---
## Features
- **Student Registration System** with secure authentication
- **Course Organization** by semester and subject
- **File Upload/Download** functionality for notes
- **Topic-based Categorization** for uploaded notes
- **Rating System** for notes quality assessment
- **Review System** for detailed feedback
- **Sorting by Rating** to display highest-rated notes first
- **User-friendly Interface** for easy navigation

---
## Technologies Used
- [Node.js](https://nodejs.org/) - Backend runtime environment
- [Express.js](https://expressjs.com/) - Web application framework
- [MySQL](https://www.mysql.com/) - Relational database management
- HTML5 - Frontend markup
- CSS3 - Styling and responsive design
- JavaScript - Client-side functionality

---
## Database Schema
The platform uses MySQL with the following main tables:
- **Users**: Student registration and authentication data
- **Courses**: Course information organized by semester
- **Notes**: Uploaded notes with metadata
- **Ratings**: User ratings for notes
- **Reviews**: Text reviews and feedback
- **Topics**: Categorization of notes by topics

---
## Key Functionalities

### Student Management
- User registration and login system
- Profile management
- Authentication and session handling

### Course Organization
- Semester-wise course display
- Course categorization
- Easy navigation between subjects

### Notes Management
- Upload notes with topic specification
- Download existing notes
- File format support for various document types
- Metadata storage for uploaded files

### Rating and Review System
- 5-star rating system for notes quality
- Written reviews for detailed feedback
- Automatic sorting by rating scores
- Average rating calculation

---
## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm package manager

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/notes-sharing-platform.git
   cd notes-sharing-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MySQL database:
   ```bash
   # Create database and tables using your preferred MySQL client
   # Database configuration is handled in db.js
   ```

4. Configure database connection:
   ```bash
   # Update database credentials in db.js file
   # Modify host, user, password, and database name as needed
   ```

5. Start the server:
   ```bash
   node server.js
   ```

6. Access the application:
   ```
   http://localhost:3000
   ```

---

---
## Database Design

### Core Tables
- Users table stores student information and credentials
- Courses table contains semester-wise course data
- Notes table holds uploaded file information and metadata
- Ratings table tracks user ratings for each note
- Reviews table stores detailed feedback from students

### Relationships
- One-to-many relationship between Users and Notes
- One-to-many relationship between Courses and Notes
- Many-to-many relationship between Users and Notes through Ratings/Reviews

---
## Features Implementation

### File Upload System
- Secure file handling with validation
- Multiple file format support
- File size limitations
- Unique filename generation

### Sorting Algorithm
- Notes sorted by average rating (highest first)
- Secondary sorting by upload date
- Real-time rating updates

### User Interface
- Responsive design for mobile and desktop
- Intuitive navigation between semesters and courses
- Clean and professional layout
- Interactive rating and review components

---
## Security Features
- Input validation and sanitization
- SQL injection prevention
- File upload security checks
- Session management
- Authentication middleware

---
## Disclaimer
This platform is designed for educational purposes to facilitate academic note sharing among students. Users are responsible for ensuring they have appropriate rights to share uploaded content.
