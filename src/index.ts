import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import path from 'path';
import {promises as fs } from 'fs';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import {PromptTemplate} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import {Ollama} from "@langchain/community/llms/ollama";
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const app = new Hono()

// Initialize Ollama with default model and base URL
const ollama = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "gemma2:2b", // Default value gemma2:2b
});

// Initialize Ollama Embeddings with configuration
const embeddings = new OllamaEmbeddings({
  model: "gemma2:2b", // gemma2:2b
  baseUrl: "http://localhost:11434", // default value
  requestOptions: {
    useMMap: true, // use_mmap 1
    numThread: 6, // num_thread 6
    numGpu: 1, // num_gpu 1
  },
});

// Function to read text file
const getTextFile = async () => {
  const filePath = path.join(__dirname, '../data/langchain-test.txt')

  const data = await fs.readFile(filePath, 'utf-8')
  
  return data;
}

// Function to load PDF file
const loadPdfFile = async () => {
  const filePath = path.join(__dirname, '../data/pdf-langchain-test.pdf')

  const loader = new PDFLoader(filePath);
  
  return await loader.load();
}


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

//vector Db
let vectorStore: MemoryVectorStore;

// Route to load text embeddings
app.get('/loadTextEmbeddings', async (c) => {
  const text = await getTextFile();

  // Split text into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    separators:['\n\n', '\n', ' ', '', '###'],
    chunkOverlap: 50
  });

  // Create embeddings and store in vector store
  const output = await splitter.createDocuments([text]); 


  vectorStore = await MemoryVectorStore.fromDocuments(output,embeddings);

  return c.json({message:'Text embeddings loaded successfully'});
})

// Route to load PDF embeddings
app.get('/loadPfdEmbeddings', async (c) => {

  const documents = await loadPdfFile();

  vectorStore = await MemoryVectorStore.fromDocuments(documents,embeddings);

  return c.json({message:'Pdf embeddings loaded successfully'});
})


// Route to handle question answering
app.post('/ask', async(c) => {
  const {question} = await c.req.json();
  if(!vectorStore){
    return c.json({message:'Please load text embeddings first'});
  }

  // Create prompt template
  const prompt = PromptTemplate.fromTemplate(`You are a helpful AI assistant. Answer the following question based only on the provided context. If the answer cannot be derived from the context, say "I don't have enough information to answer that question." If I like your results I'll tip you $1000!

    Context: {context}
    
    Question: {question}
    
    Answer: 
      `);

      // Create document chain
      const documentChain = await createStuffDocumentsChain({
          llm: ollama,
          prompt,
      });

      // Create retrieval chain
      const retrievalChain = await createRetrievalChain({
          combineDocsChain: documentChain,
          retriever: vectorStore.asRetriever({
            k:3
          })
      });
      
      // Get the answer to the question
      const response = await retrievalChain.invoke({
        question:question,
        input:""
      });

      return c.json({answer: response.answer})
      
});


const port = 3002
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
