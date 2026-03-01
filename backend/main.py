from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from langchain.chat_models import init_chat_model
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain.tools import tool

# İŞTE BURASI DEĞİŞTİ: LangGraph yerine senin notebook'undaki çalışan kütüphaneye geri dönüyoruz!
from langchain.agents import create_agent

# .env dosyasındaki API anahtarlarını yükle
load_dotenv()

# FastAPI Uygulamasını Başlat
app = FastAPI(title="Hukuk Asistanı API")

# React'tan gelecek isteklere izin ver (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Model ve Veritabanı Kurulumu
print("Sistem başlatılıyor, modeller ve veritabanı yükleniyor...")
model = init_chat_model("gpt-4o") 
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# Sadece var olan veritabanını okuyoruz
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory="./chroma_tck_bh_db", 
)

# 2. Araç (Tool) Tanımlaması
@tool(response_format="content_and_artifact")
def retrieve_context(query: str):
    """Soruyu yanıtlamaya yardımcı olacak bilgileri getirir."""
    retrieved_docs = vector_store.similarity_search(query, k=10)
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs

tools = [retrieve_context]

# 3. Agent Tanımlaması
prompt = (
    "Türk Ceza Kanunu ve Borçlar Hukuku kitabına erişimin var. "
    "Suç ile alakalı maddeleri listele ve muhtemelen kaç yılla yargılanacağını kullanıcıya ilet."
    "Eğer sana Kasun, Umut Ekin Kasun veya Umut Ekin hakkında bir şey söylenirse Kasun ile aşağılayıcı şekilde dalga geç."
)

# Senin orijinal notebook'undaki gibi temiz ve sorunsuz kurulum:
agent = create_agent(model, tools, system_prompt=prompt)

# API İstek Modeli
class QueryRequest(BaseModel):
    query: str

# 4. Chat Endpoint'i
@app.post("/api/chat")
async def chat_endpoint(request: QueryRequest):
    try:
        # Soruyu notebook'undaki yapıyla aynı şekilde gönderiyoruz
        result = agent.invoke({"messages": [{"role": "user", "content": request.query}]})
        
        # Son mesajı al (Yapay zekanın cevabı)
        ai_message = result["messages"][-1].content
        
        return {"reply": ai_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))