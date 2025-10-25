# 🌐 Professional Developer Portfolio

A **modern, responsive, and dynamic portfolio website** with a **powerful admin panel** that allows you to manage all your content — profile, projects, skills, and messages — without writing a single line of code.

---

## ✨ Features

### 🧑‍💻 Portfolio Website
- **Professional Landing Page** – Clean hero section with your name, photo, and introduction  
- **About Section** – Share your bio and contact information  
- **Skills Showcase** – Display your technical skills with icons and progress bars  
- **Projects Gallery** – Showcase your work with descriptions, images, and live/demo links  
- **Contact Form** – Visitors can reach you directly through the form  
- **Responsive Design** – Works perfectly across desktop, tablet, and mobile devices  

### 🔐 Admin Panel
- **Secure Authentication** – Sign up and log in using your own credentials  
- **User Registration** – New users can register directly from the login page (username, password, confirm password)  
- **Profile Management** – Update your bio, photo, and social links  
- **Project Management** – Add, edit, or delete portfolio projects  
- **Skills Management** – Manage your technical skills with proficiency levels  
- **Message Inbox** – View, mark, and delete messages from visitors  
- **Real-time Updates** – Instantly reflect changes on your live portfolio  

---

## 🚀 Getting Started

### 🧭 Admin Panel Access
1. **If you don’t have an account yet**, click **“Sign Up”** to create one  
2. After registration, log in with your new credentials  

---

## 🛠️ First Steps After Login

### 1. Update Your Profile
- Navigate to **Edit Profile**
- Add your name, title, bio, and contact details
- Include your social media links (GitHub, LinkedIn, Twitter, etc.)
- Click **Save Changes**

### 2. Upload Your Photo
- Replace the placeholder image with your own
- Upload your photo to `assets/images/` (e.g., `developer.jpg`)

#### 3. Add Your Skills
- Go to **Manage Skills**
- Click **Add New Skill**
- Enter skill name, category, and proficiency (0-100)
- For logo URLs, you can use:
  - DevIcon CDN: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/[tech]/[tech]-original.svg`
  - Example: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg`
- Click **Add Skill**


### 4. Add Your Projects
- Go to **Manage Projects**
- Fill in title, description, URLs, tech stack, and image
- Optionally mark as *featured*

### 5. Manage Messages
- Access **Messages** in the admin panel
- View contact form submissions
- Mark messages as read or delete spam  

---

## 🔒 Security Notes

### Change Your Password
- Use the **Edit Profile** section to update your password anytime  
- Passwords are securely hashed using PHP’s `password_hash()`  

### CSRF Protection
All admin forms include **CSRF tokens** to prevent unauthorized requests.

---

## 🗄️ Database Overview

| Table | Description |
|--------|--------------|
| **admin_users** | Stores user credentials |
| **adminn_info** | Profile and about info |
| **skills** | Technical skills and proficiency |
| **projects** | Project data |
| **contact_messages** | Messages from the contact form |

---

## ⚙️ Technical Stack

- **Frontend:** React (located in `/frontend`)  
- React Router for navigation  
- Axios for API requests  
- TailwindCSS / CSS Modules for styling  
- **Backend:** PHP 8.4  
- **Database:** MySQL  
- **Server:** PHP Built-in Server  
- **Icons:** Font Awesome + DevIcon  

---

## 🎨 Customization

### Change Colors
In your React app (`frontend/src/styles/variables.css` or similar):
```css
:root {
--primary-color: #3498db;
--secondary-color: #2c3e50;
--accent-color: #e74c3c;
}

---

## Troubleshooting

### Portfolio not loading?
- Check that the workflow "Portfolio Server" is running
- Refresh your browser
- Clear browser cache

### Admin login not working?
- Ensure you're using the correct credentials
- Check that sessions are enabled in PHP

### Changes not appearing?
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check that you saved changes in the admin panel

### Database errors?
- The database is automatically configured
- Connection details are in environment variables
- Check logs for specific error messages

---


