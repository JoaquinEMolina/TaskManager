# Final Project CS50W – Capstone

## Tasks Manager

### 📝 Overview

**Tasks Manager** is a dynamic SPA (Single Page Application) built as the final project for the CS50W course. It provides users with a tool to manage tasks and projects collaboratively, offering a modern and interactive interface. Users can create tasks, assign multiple users, group them by projects, and apply dynamic filters in real-time. This tool is intended for personal use and small teams.

---

### 🚩 Distinctiveness and Complexity

This project is significantly different from the others in the course and meets the complexity requirement for the following reasons:

- It is **not a social network**, an **e-commerce site**, or a **clone** of previous projects.
- The **architecture** is unique, with a custom relational model involving multiple related entities (Task, Project, User, Comment).
- Implements a **dynamic SPA** with real-time filtering, client-side rendering, modal-based CRUD, and fade transitions.
- Supports **role-based behavior**, where only creators or assigned users can edit, close, or delete tasks or projects.
- The interface is **fully responsive** and optimized for mobile use.

#### Features that increase complexity:

- **Django REST Framework (DRF)** is used for building the backend API (serializers, viewsets, filtering), but **not for authentication**—standard Django views handle login/logout/registration.
- **Choices.js** is used to enhance multi-select fields for assigning users and filtering by status.
- **Flatpickr** is used for intuitive and correctly formatted date inputs.
- **Real-time dynamic filters** allow users to filter by title, project, user, and status without reloading.
- The system is **designed for extensibility**, making it easy to add dashboards, analytics, CSV export, or subtasks.

This goes beyond course requirements by blending Django with a modular JavaScript frontend and DRF-powered backend.


This combination of custom architecture, SPA behavior, external integrations, and advanced Django usage ensures the project is both distinctive and complex.

---

### 📁 Project Structure

- `manage.py`: Django’s main script to interact with the project.
- `capstone/`: Global Django configuration.
- `tasks/`: Core app for task management.
  - `models.py`: Defines models for Task, Project, User, and Comment.
  - `serializers.py`: Handles model-to-JSON serialization using DRF.
  - `views.py`: API endpoints using ViewSets and authentication views.
  - `templates/tasks/`: HTML templates for SPA, login, and register pages.
  - `static/tasks/`: JavaScript and CSS assets (modularized in `index.js`).
- `requirements.txt`: Lists Python dependencies.
- `db.sqlite3`: SQLite database (development only).

---

### ▶️ How to Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JoaquinEMolina/taskManage.git
   cd taskManage



## How to run the project
1. Clone the Repository:
   ```bash
   git clone https://github.com/tu-usuario/tasks-manager.git
   cd tasks-manager
   ```

2. Create virtual enviroment:
   ```bash
   python -m venv env
   source env/bin/activate  # in Windows: env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Run development server:
   ```bash
   python manage.py runserver
   ```

7. visit the app at: http://localhost:8000


## System requirements

- Python 3.10+
- Django 5.2.3
- Dependencies: djangorestframework, choices.js, flatpickr

**Autor:** Joaquin Molina  
**Email:** joaquinn.molina@gmail.com  
**GitHub User:** JoaquinEMolina
**Course:** CS50’s Web Programming with Python and JavaScript