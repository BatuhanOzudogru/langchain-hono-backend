# Langchain-Hono-AI-Assistant

This project is a simple AI assistant built using the Hono framework and LangChain. It loads text and PDF documents, creates embeddings, and allows you to ask questions based on the content of the documents.

## Prerequisites

- Node.js
- Yarn or npm
- Ollama server running locally (base URL: http://localhost:11434)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/BatuhanOzudogru/langchain-hono-backend.git
    cd langchain-hono-backend
    ```

2. Install dependencies:
    ```bash
    yarn install
    # or
    npm install
    ```

3. Place your text file (`langchain-test.txt`) and PDF file (`pdf-langchain-test.pdf`) in the `data` directory.



The server will start on port 3002.

## API Endpoints

### GET /

Returns a simple greeting message.

### GET /loadTextEmbeddings

Loads the text file, creates embeddings, and stores them in a vector store.

#### Example Request in Postman

- **Method**: GET
- **URL**: `http://localhost:3002/loadTextEmbeddings`

#### Example Response

```json
{
  "message": "Text embeddings loaded successfully"
}
```




### GET /loadPdfEmbeddings

Loads the PDF file, creates embeddings, and stores them in a vector store.

#### Example Request in Postman

- **Method**: GET
- **URL**: `http://localhost:3002/loadPdfEmbeddings`

#### Example Response

```json
{
  "message": "Pdf embeddings loaded successfully"
}
```

### POST /ask
Allows you to ask questions based on the loaded embeddings.

Request Body
```json
{
  "question": "Your question here"
}
```

#### Example Request in Postman
- **Method**: POST
- **URL**: `http://localhost:3002/ask`

- **Headers**: Content-Type: application/json
- **Body**: (raw JSON)
```json
{
  "question": "What is the main topic of the document?"
}
```
#### Example Response
```json
{
  "answer": "The answer to your question"
}
```