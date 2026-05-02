# DevLabs — Developer Community Platform

A full-stack developer community platform designed to enable collaboration, learning, and career growth. DevLabs provides a centralized environment where developers can solve problems, share knowledge, explore content, and discover opportunities.

**Repository:** [https://github.com/000sami000/DevLabs](https://github.com/000sami000/DevLabs)

---

## Overview

DevLabs is built to support developers across different stages of their journey. It integrates problem-solving, content creation, learning resources, job discovery, and collaboration tools into a single platform.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, Tailwind CSS, Editor.js, Quill.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Auth** | JSON Web Tokens (JWT) |
| **Extras** | Map-based job visualization, Job scraping utilities, Collaborative whiteboard |

---

## Features

### 🧩 Problem Solving
- Post coding problems
- Submit and browse solutions
- Community-driven discussions

### 📝 Article Platform
- Rich text editor support
- Tag-based categorization
- Thumbnail-based content presentation

### 📚 Course Section
- Admin-uploaded PDF learning materials
- Structured educational content

### 💼 Job Portal
- Scraped job listings
- Map-based job location navigation

### 👤 User Profiles
- Profile management
- Activity tracking and dashboards

### 🎨 Collaborative Whiteboard
- Real-time brainstorming tool
- Persistent saved sessions

### 📊 Analytics Dashboard
- Platform usage insights
- User engagement tracking

---

## Project Structure

```
DevLabs/
│
├── client/        # Frontend application
├── server/        # Backend application
│
└── package.json   # Root configuration
```

---

## Root Scripts

```json
{
  "name": "devlabs",
  "private": true,
  "scripts": {
    "dev:client": "npm --prefix client run dev",
    "dev:server": "npm --prefix server run dev",
    "build:client": "npm --prefix client run build",
    "start:server": "npm --prefix server run start",
    "lint:client": "npm --prefix client run lint"
  }
}
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Run the Application

```bash
# In separate terminals
npm run dev:client
npm run dev:server
```

---

## Architecture

- Modular full-stack architecture with separate client and server layers
- RESTful API design using Express.js
- Secure authentication using JWT
- Structured content management for rich text editors
- Scalable MongoDB schema design
- Support for real-time collaborative features

---

## Timeline

**December 2023 – February 2024**  
University of Engineering and Technology, Lahore

---

## Use Cases

- Practicing data structures and algorithms
- Publishing technical articles
- Accessing curated learning materials
- Exploring job opportunities
- Collaborating on ideas and problem-solving

---

## Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] AI-assisted code suggestions
- [ ] Improved mobile responsiveness
- [ ] Multi-language support
- [ ] Advanced analytics and recommendation systems

---

## Author

**Muhammad Sami** — Software Engineer

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

## Contribution

Contributions are welcome. Please fork the repository and submit a pull request for review.
