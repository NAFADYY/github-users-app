# GitHub Users App

Explore GitHub users with search, pagination, favorites, and user details.  
Built using **React (Vite)**, **React Router**, **TailwindCSS**, and optimized for **SEO**.

---

## 🚀 Features

- 🔍 Search GitHub users with API integration
- 📄 Pagination & Infinite scroll (future work)
- ⭐ Save users to favorites (local storage)
- 📱 Responsive design (mobile-first)
- 🎭 Skeleton loaders (planned)
- 📡 Offline support (planned)
- 📋 User details (repos, profile info)

---

## 🛠 Tech Stack

- **React 18 + Vite**
- **React Router v6**
- **Zustand** (state management for favorites)
- **Axios** (API calls with GitHub token support)
- **TailwindCSS** (styling)
- **Framer Motion** (animations)
- **React Helmet Async** (SEO management)

---

## 📂 Project Structure

.github-users-app/
├─ package.json
├─ vite.config.js
├─ index.html
├─ public/
│ ├─ social-cover.png
│ ├─ site.webmanifest
│ ├─ robots.txt
│ └─ sitemap.xml
├─ src/
│ ├─ main.jsx
│ ├─ App.jsx
│ ├─ styles.css
│ ├─ hooks/
│ │ ├─ useDebounce.js
│ │ └─ useSmartTitle.js
│ ├─ store/
│ │ └─ useFavoritesStore.js
│ ├─ components/
│ │ ├─ Navbar.jsx
│ │ ├─ SEO.jsx
│ │ ├─ UserCard.jsx
│ │ ├─ Pagination.jsx
│ │ └─ EmptyState.jsx
│ ├─ pages/
│ │ ├─ Home.jsx
│ │ ├─ Favorites.jsx
│ │ └─ UserDetails.jsx
│ └─ utils/
│ ├─ ghFetch.js
│ └─ paginate.js
└─ tests/
└─ paginate.test.jsx


---

## ⚙️ Installation & Setup

1. **Clone repo**
   ```bash
   git clone https://github.com/your-username/github-users-app.git
   cd github-users-app
2.Install dependencies
npm install


3.Environment variables
Create a .env file in the root:

VITE_GH_TOKEN=your_github_token_here

Run locally
npm run dev

Build for production

npm run build
npm run preview






