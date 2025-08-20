# MongoDB Data Modeling: Quick Guide

Here's a simple breakdown of how data is organized in MongoDB.

---

### 1. Linking Data (Normalization)

**Think of it like:** A library card for a book. The card has the book's title, but for author details, it just says "See Author ID: 123".

*   **What it is:** Storing related info in separate lists (collections) and connecting them using unique IDs.
*   **Example:** Your `Tour` has a `guide` field that only stores the `User`'s ID.

**Why use it?**
*   Less repeated data.
*   Easier to update info (change a guide's photo once, it updates everywhere).

---

### 2. Getting Linked Data (`populate`)

**Think of it like:** Asking the librarian, "Can you get me the book for Author ID: 123?"

*   **What it is:** A Mongoose tool that automatically fetches the full details of linked items.
*   **How it works:** When you ask for a `Tour`, `populate` goes and gets the `User` details for the `guide` ID and puts them into your `Tour` data.

---

### 3. Copying Data (Denormalization)

**Think of it like:** Writing *all* the author's details directly on the book's library card.

*   **What it is:** Storing a copy of related info directly inside another document.
*   **Example:** Your `Tour` could have the `guide`'s name and photo directly saved within the `Tour` document itself.

**Why use it?**
*   Faster to read (all info is in one place).

**Why be careful?**
*   Lots of repeated data.
*   Harder to update (if a guide's name changes, you must update every tour they are copied into).

---

### When to Choose?

*   **Link (Normalize) if:** Data changes often (like user profiles) or is complex.
*   **Copy (Denormalize) if:** Data rarely changes (like a product's fixed features) and you need super fast reads.
