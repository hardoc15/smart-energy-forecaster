from fastapi import FastAPI
from routers import upload, clean, forecast, metrics, train
from .api import forecast_all, data_preview
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title="Smart Energy Forecaster",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(clean.router)
app.include_router(forecast.router)
app.include_router(metrics.router)
app.include_router(train.router)
app.include_router(forecast_all.router)
app.include_router(data_preview.router) 




