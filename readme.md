# Turkish Law RAG Agent

* [About the Project](#about-the-project)
* [Installation](#installation)

---

## About the Project

This is a RAG (Retrieval-Augmented Generation) Agent project developed using the Turkish Penal Code and the Code of Obligations. (Türk Ceza Kanunu ve Borçlar Hukuku)

**GPT-4o** was used as the LLM. The relevant legal texts were divided into meaningful chunks, stored in **ChromaDB** as a vector database, and integrated into the model.

---

## Installation

You can follow the steps below to test and develop the project in your local environment.

### Backend

First, go to the backend directory and start the server with Uvicorn:

```bash
cd backend
uvicorn main:app --reload
```

### Frontend

Then open a new terminal, navigate to the frontend folder, and run the static site:

```bash
cd frontend
npm run dev
```