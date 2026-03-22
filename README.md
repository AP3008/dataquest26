![Description](https://github.com/AP3008/dataquest26/assets/hero.png)
# ArgusLabs — Brain Tumor MRI Classifier

**DataQuest ’26 — Healthcare & Wellbeing**

A full-stack prototype that classifies brain MRI scans into **four categories** using a **custom CNN trained from scratch** (no pretrained backbones), with a **React** frontend and **FastAPI** inference API.

---

## What it does

Upload a brain MRI image and the model returns:

| Class | Description |
|-------|-------------|
| **Glioma** | Tumor originating in glial cells |
| **Meningioma** | Tumor on the membranes covering the brain |
| **Pituitary** | Tumor in the pituitary region |
| **No tumor** | Healthy scan (`notumor` in the API) |

The UI includes an interactive 3D brain visualization driven by the model’s per-class probabilities.

---

## Repository layout

```
dataquest26/
├── backend/          # FastAPI + PyTorch inference
│   ├── main.py
│   ├── inference.py
│   ├── model.py
│   ├── models/       # brain_tumor_classifier.pth (add locally or via LFS)
│   ├── notebooks/    # Colab-exported training notebook
│   └── results/      # Training plots (e.g. confusion matrix)
├── frontend/         # React + TypeScript + Vite
├── HANDOFF.md        # API contract for frontend ↔ backend
└── README.md         # This file
```

---

## Tech stack

- **ML:** PyTorch, torchvision (128×128 RGB, custom `BrainTumorCNN`)
- **API:** FastAPI, Uvicorn, `python-multipart`
- **Frontend:** React, TypeScript, Vite, Tailwind (3D brain via Three.js assets/components)

---

## Getting started & Deployment

### Run with Docker (Recommended for Deployment)

The project includes a multi-stage Dockerfile that builds the React frontend and serves it directly from the FastAPI backend. This is the easiest way to run and deploy the app as a single service.

```bash
docker build -t neurascan .
docker run -p 8000:8000 neurascan
```

The app will be available at [http://localhost:8000](http://localhost:8000).

*Note: Ensure `backend/models/brain_tumor_classifier.pth` is present before building!*

### Run Locally (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API: [http://localhost:8000](http://localhost:8000) — docs at [http://localhost:8000/docs](http://localhost:8000/docs).

Ensure `backend/models/brain_tumor_classifier.pth` is present.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173). The client respects the `VITE_API_URL` environment variable to locate the API, defaulting to relative standard behavior when running together.

---

## Training

Training is documented in `backend/notebooks/DataQuest26_BrainTumor.ipynb` (run on **Google Colab** with GPU). The notebook downloads data from Kaggle, trains the CNN, evaluates on a held-out test set, and saves `brain_tumor_classifier.pth`.

---

## Dataset

[Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset) — thousands of MRI images across four classes.

---

## Results

On the full official **test** split (~1,600 images), the trained model reaches approximately **92% overall accuracy** (see `backend/results/` for confusion matrix and slides). Per-class precision/recall varies; **glioma** remains the hardest class.

---

## Frontend ↔ backend

See **[HANDOFF.md](./HANDOFF.md)** for the `POST /upload-mri` contract (`multipart/form-data`, field `file`, JSON response shape).

---

## Team

Adam Porbanderwalla, Tareq Kurdiah, Kamyar Modabber, Nima Abbasi.

---

## Disclaimer

Educational and hackathon use only. **Not** a medical device and **not** a substitute for professional diagnosis or treatment.
