# 🧭 Overview

This is a **professional developer portfolio website** with an integrated **admin panel**.  
The system allows developers to **showcase their work, skills, and contact information** through a **modern, responsive React frontend**, while managing all content via a **secure PHP-based admin interface**.  

No coding knowledge is required — everything can be managed visually.  

**Last Updated:** October 11, 2025  
**Status:** ✅ Production Ready  

---

# 💬 User Preferences
Preferred communication style: Simple, everyday language.

---

# 🧩 Recent Changes

## October 11, 2025 – Initial Implementation
- Built complete portfolio website with React frontend
- Created PHP backend with RESTful API endpoints
- Implemented MySQL (previously PostgreSQL) database schema for content management
- Developed secure admin panel with CSRF protection and authentication
- Added comprehensive input validation and prepared statements
- Integrated placeholder developer photo and tech logos via CDN
- Created full `README.md` for setup and usage

---

# ⚙️ System Architecture

## 🎨 Frontend Architecture

**React Portfolio App**
- Built using **React** (located in `/frontend`)
- Component-based architecture with reusable UI elements
- **Tailwind CSS** for utility-first responsive design
- **Axios** for RESTful API communication
- **React Router** for navigation
- Smooth transitions and animation for enhanced user experience
- Deployed as a static SPA communicating with PHP backend

**Design Pattern:**  
Single Page Application (SPA) with REST API data fetching from backend.

**File Structure:**
- `/frontend/public/` – Public assets and HTML entry point  
- `/frontend/src/` – React components, services, and pages  
- `/frontend/src/App.css` – Custom styles and Tailwind utilities  

---

## 🧠 Backend Architecture

**PHP 8.4 Server**
- Backend built with PHP and RESTful API endpoints
- Handles content CRUD operations for portfolio data
- Session-based authentication for the admin area
- CSRF protection on all admin forms
- Uses **prepared statements** for SQL security

**Key Files:**
- `index.php` – Entry point and router  
- `config/database.php` – MySQL connection setup  
- `api/portfolio.php` – Public data endpoint  
- `api/contact.php` – Contact form submission endpoint  
- `admin/*.php` – Admin interface  

**Rationale:**  
PHP provides simplicity, broad hosting support, and easy integration with MySQL.  

---

## 🗄️ Data Storage

**MySQL Database**
- Stores portfolio data, skills, and contact submissions
- All credentials stored in environment variables
- Passwords hashed using `password_hash()` (bcrypt)
- Profile photos stored in `/assets/images/`
- Skill logos loaded from DevIcon CDN

**Tables:**
- `admin_users` – Admin login credentials  
- `portfolio_info` – User profile information  
- `skills` – Technical skills with icons and proficiency levels  
- `projects` – Portfolio projects with links and images  
- `contact_messages` – Contact form submissions  

---

## 🔑 Authentication & Authorization

**Session-based Authentication**
- Admin login with username and password  
- Passwords securely hashed  
- CSRF tokens generated for each session  
- Middleware (`auth_check.php`) enforces authentication  

**Security Features:**
- CSRF protection on all forms  
- Prepared statements prevent SQL injection  
- `htmlspecialchars()` used to escape user input  
- Session timeout for inactive users  

---

## 🧰 Admin Panel Features

**Built-in CMS (Content Management System)**
- **Profile Management:** Update name, title, contact info, and social links  
- **Skills Management:** Add, edit, and delete technical skills  
- **Project Management:** CRUD for projects with images and URLs  
- **Message Inbox:** Manage contact messages  
- **Real-time Sync:** Changes reflect instantly on frontend  

**File Structure:**
- `admin/login.php` – Secure login  
- `admin/dashboard.php` – Admin overview  
- `admin/edit_profile.php` – Profile editor  
- `admin/manage_projects.php` – Projects manager  
- `admin/manage_skills.php` – Skills manager  
- `admin/messages.php` – Message inbox  
- `admin/csrf.php` – CSRF utilities  
- `admin/auth_check.php` – Middleware  
- `admin/admin-styles.css` – UI styling  

---

## 📦 External Dependencies

### Frontend
- **React 18+**  
- **Axios** – HTTP client for API calls  
- **Tailwind CSS** – Utility-first CSS framework  
- **Font Awesome 6.4.0** – Icon set  
- **DevIcon CDN** – Technology logos  

### Backend
- **PHP 8.4**  
- **MySQL**  
- **PDO (PHP Data Objects)** for secure DB interaction  

### Hosting
- **Replit** or any PHP-enabled hosting  
- Portfolio: `https://[your-replit-url].repl.co`  
- Admin: `https://[your-replit-url].repl.co/admin/login.php`  
- Server Command: `php -S 0.0.0.0:5000 index.php`  

---

## 🌐 API Endpoints

### Public
- `GET /api/portfolio.php` – Fetches portfolio data (profile, skills, projects)  
- `POST /api/contact.php` – Submits contact messages  

### Admin
- Protected endpoints for managing projects, skills, and profile  
- Requires authentication and CSRF token validation  

---

## 🖼️ Asset Storage

| Type | Location |
|------|-----------|
| Images | `/assets/images/` |
| Logos | DevIcon CDN |
| Uploaded content | Stored via URL references in database |

---

## 🧱 Project Structure

/
├── admin/ # Admin panel files
│ ├── admin-styles.css
│ ├── auth_check.php
│ ├── csrf.php
│ ├── dashboard.php
│ ├── edit_profile.php
│ ├── login.php
│ ├── logout.php
│ ├── manage_projects.php
│ ├── manage_skills.php
│ ├── messages.php
│ └── sidebar.php
├── api/ # API endpoints
│ ├── contact.php
│ └── portfolio.php
├── assets/
│ ├── images/
│ │ └── developer.jpg
│ └── logos/
├── config/
│ ├── database.php
│ └── init_db.php
├── frontend/ # React frontend
│ ├── public/
│ ├── src/
│ └── App.css
├── README.md
└── info.


---

## 🔒 Security Considerations

1. Change default credentials immediately after first login  
2. CSRF protection enabled on all forms  
3. SQL injection prevented via prepared statements  
4. XSS protection through output escaping  
5. Secure session handling with timeout  

---

## 🚀 Future Enhancements

- Change password feature in admin panel  
- Profile and project image uploads  
- Blog section with rich text editor  
- Testimonials management  
- Analytics dashboard for visits  
- Multi-language support  
- Dark mode toggle  
- Data export (JSON/PDF)  
- Email notifications for messages  
