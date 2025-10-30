# 📚 Book Finder — React + Tailwind

**Book Finder** is a web application that helps users discover, organize, and save books effortlessly using the **Open Library API**.  
It offers two intelligent modes — **Normal Mode** for leisure reading and **Student Mode** for study and exam preparation.

---

## 🎯 Overview

| Mode | Purpose | Save Location | Filter Type |
|------|----------|----------------|--------------|
| **Normal Mode** | For casual readers and hobby readers | ❤️ Favourites | Genre |
| **Student Mode** | For students preparing for exams | 🎓 Repository | Subject |

Each mode provides a customized experience — whether you’re searching for fun weekend reads or researching academic material.

---

## ✨ Features

### 🔍 Smart Book Search
- Search books instantly by **title** using the [Open Library API](https://openlibrary.org/developers/api).
- Displays book **cover**, **author**, and **publication year**.

### ❤️ Save Books
- In **Normal Mode**, save books to your **Favourites** list.
- In **Student Mode**, save books to your **Repository** for quick access to study materials.

### 🎚️ Filters & Sorting
- **Normal Mode:** Filter by **Genre**
- **Student Mode:** Filter by **Subject**
- Sort results by **Relevance**, **Newest**, or **Oldest**

### 🌙 Dark Theme
- Toggle between **Light** and **Dark** themes — perfect for late-night study sessions.

### 📱 Responsive Design
- Fully responsive layout for **mobile**, **tablet**, and **desktop**.
- Smooth UI experience even on smaller screens.

### ⚠️ Error Handling
- Displays **friendly error messages** for:
  - Network failures
  - No results found
  - Timeout or API issues

### 💾 Local Storage
- Favourites and Repository data are **persisted locally** so users don’t lose saved books after reloads.

---

## 🛠️ Tech Stack

- **React (Vite)** — Frontend framework  
- **Tailwind CSS** — Modern utility-first styling  
- **Open Library API** — Public API for book search  
- **LocalStorage** — Persistent book saving  
- **Responsive Design** — Works across all devices

---

## 🧠 Why Two Modes?

- **Normal Mode:**  
  Designed for readers who want to explore books for entertainment, self-improvement, or leisure.

- **Student Mode:**  
  Tailored for academic users — focusing on study materials, subjects, and preparation guides.  
  Includes features like dark mode for night study and subject-based filtering.

---

## 🚀 Getting Started

### 1. Clone this repository
```bash
git clone https://github.com/poojatr1441/book-finder.git
cd book-finder
