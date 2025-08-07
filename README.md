# ⚡ Smart Energy Forecaster

A full-stack energy consumption forecasting app that uses three machine learning models — CatBoost, Prophet, and LSTM — to predict short-term energy usage. Built with a React frontend, FastAPI backend, and containerized with Docker for seamless local development and deployment.

---

## 🚀 Features

- 🧠 **ML Forecasting Models**
  - **CatBoost** for fast tree-based modeling
  - **Prophet** for time series decomposition
  - **LSTM** for sequence modeling with PyTorch
- 📈 **Visual Results**
  - Displays 3 separate graphs (actual vs predicted)
  - Highlights the most accurate model (lowest RMSE)
- 📊 **Evaluation Metrics**
  - MAE, RMSE, and MAPE for all models
- 💡 **Clean Interface**
  - Drag-and-drop upload
  - One-click forecasting and result visualization
- 🐳 **Dockerized**
  - Separate containers for frontend and backend via `docker-compose`

---

## 🛠 Tech Stack

| Layer       | Technology           |
|-------------|----------------------|
| Frontend    | React + Vite + Nginx |
| Backend     | FastAPI              |
| ML Models   | CatBoost, Prophet, LSTM (PyTorch) |
| Container   | Docker + Docker Compose |
| Deployment  | Vercel (Frontend) + Render/Railway (Backend) |

---

## 📦 Local Development


### 1. Clone the repo

```bash
git clone https://github.com/hardoc15/smart-energy-forecaster.git
cd smart-energy-forecaster
