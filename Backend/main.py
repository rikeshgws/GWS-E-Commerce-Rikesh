from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.graphqlRoute import router
from config.database import engine, Base
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Get Me API", description="GraphQL API for Get Me")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("templates/static/products", exist_ok=True)
app.mount("/static", StaticFiles(directory="templates/static"), name="static")

@app.on_event("startup")
async def startup():
    print("Get Me App started successfully")

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Get Me API", "graphql_endpoint": "/graphql"}
