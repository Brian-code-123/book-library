# LAB 2 - Online Book Library System

A full-stack web application for managing an online book library, built with modern development tools and best practices.

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    Online Book Library System                    │
├─────────────────────────────────────────────────────────────────┤
│  Frontend          │  Backend           │  Database              │
│  ─────────         │  ────────          │  ─────────             │
│  Vue.js 3          │  Node.js           │  MongoDB               │
│  Vite              │  Express.js        │  Mongoose              │
│                    │                    │                        │
├─────────────────────────────────────────────────────────────────┤
│  Documentation                                                   │
│  ─────────────                                                   │
│  Markdown                                                        │
│  MermaidJS                                                       │
│  Pencil AI                                                       │
├─────────────────────────────────────────────────────────────────┤
│  AI Development Tools & Workflow                                 │
│  ─────────────────────────────────                               │
│  Spec Kitty (Specification-Driven Development)                   │
│  VS Code + GitHub Copilot                                        │
│  MCP Servers (Serena, DeepWiki, MongoDB, Pencil)                 │
└─────────────────────────────────────────────────────────────────┘
```

## System Architecture

### User Flow

```mermaid
flowchart TD
    A[User visits library] --> B{Is logged in?}
    B -->|Yes| C[Show dashboard]
    B -->|No| D[Show login page]
    D --> E[User enters credentials]
    E --> F{Valid credentials?}
    F -->|Yes| C
    F -->|No| G[Show error]
    G --> D
```

### API Interaction Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Vue.js Frontend
    participant Backend as Express Backend
    participant DB as MongoDB

    User->>Frontend: Search for "JavaScript"
    Frontend->>Backend: GET /api/books?search=JavaScript
    Backend->>DB: db.books.find({title: /JavaScript/})
    DB-->>Backend: [Book1, Book2, Book3]
    Backend-->>Frontend: JSON Response
    Frontend-->>User: Display book list
```

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BORROW_RECORD : borrows
    USER {
        ObjectId _id PK
        string username
        string email
        string password_hash
        date created_at
    }
    BOOK ||--o{ BORROW_RECORD : borrowed_in
    BOOK {
        ObjectId _id PK
        string title
        string author
        string isbn
        int quantity
        string category
    }
    BORROW_RECORD {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId book_id FK
        date borrow_date
        date due_date
        date return_date
        string status
    }
    CATEGORY ||--o{ BOOK : contains
    CATEGORY {
        ObjectId _id PK
        string name
        string description
    }
```

### Class Diagram

```mermaid
classDiagram
    class Book {
        -ObjectId _id
        -String title
        -String author
        -String isbn
        -int quantity
        +getAvailableCopies() int
        +borrow(userId) boolean
        +return(userId) boolean
    }
    
    class User {
        -ObjectId _id
        -String username
        -String email
        -String passwordHash
        +authenticate(password) boolean
        +getBorrowedBooks() Book[]
    }
    
    class BorrowRecord {
        -ObjectId _id
        -Date borrowDate
        -Date dueDate
        -Date returnDate
        -String status
        +isOverdue() boolean
        +calculateFine() number
    }
    
    User "1" --> "*" BorrowRecord : has
    Book "1" --> "*" BorrowRecord : referenced_in
```

### Book State Diagram

```mermaid
stateDiagram-v2
    [*] --> Available: Book added
    
    Available --> Borrowed: User borrows
    Borrowed --> Available: User returns
    Borrowed --> Overdue: Due date passed
    Overdue --> Available: User returns + pays fine
    
    Available --> Reserved: User reserves
    Reserved --> Borrowed: User picks up
    Reserved --> Available: Reservation expires
    
    Available --> Maintenance: Damaged
    Maintenance --> Available: Repaired
    Maintenance --> [*]: Discarded
```

### Development Timeline

```mermaid
gantt
    title Online Book Library Development Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements Analysis    :a1, 2026-02-01, 7d
    System Design           :a2, after a1, 5d
    UI/UX Prototyping       :a3, after a1, 7d
    
    section Backend Development
    Database Schema         :b1, after a2, 3d
    User Authentication     :b2, after b1, 5d
    Book CRUD APIs          :b3, after b2, 7d
    Borrow System APIs      :b4, after b3, 5d
    
    section Frontend Development
    Project Setup           :c1, after a3, 2d
    Authentication UI       :c2, after c1, 5d
    Book Management UI      :c3, after c2, 7d
    User Dashboard          :c4, after c3, 5d
    
    section Deployment
    Production Setup        :e1, after c4, 3d
    Go Live                 :milestone, after e1, 0d
```

### System Context (C4)

```mermaid
C4Context
    title System Context diagram for Online Book Library

    Person(user, "Library User", "A user who borrows and returns books")
    Person(admin, "Library Admin", "Manages books and users")
    
    System(library, "Online Book Library", "Allows users to browse, borrow, and return books online")
    
    System_Ext(email, "Email System", "Sends notifications about due dates and reservations")
    System_Ext(payment, "Payment Gateway", "Processes fine payments")
    
    Rel(user, library, "Uses")
    Rel(admin, library, "Manages")
    Rel(library, email, "Sends emails using")
    Rel(library, payment, "Processes payments via")
```

## Features

- **User Authentication**: Email/password login and registration with JWT
- **Book Catalog**: Browse, search, and filter books with pagination
- **Borrowing System**: Borrow/return books, overdue detection, fine calculation
- **User Dashboard**: View borrowed books, due dates, recommendations
- **Admin Panel**: Add/edit/delete books, view active borrows

## Getting Started

```bash
# Backend
cd book-library/backend
npm install
npm start

# Frontend
cd book-library/frontend
npm install
npm run dev
```
