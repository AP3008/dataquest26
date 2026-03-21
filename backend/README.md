# Backend — NeuraScan API

FastAPI server that accepts a brain MRI image and returns a classification result using a custom CNN trained from scratch on the [Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset).

## Structure

```
backend/
├── main.py            # FastAPI app, CORS, /upload-mri endpoint
├── inference.py       # Loads model once at startup, runs predictions
├── model.py           # BrainTumorCNN architecture (must match training)
├── models/
│   └── brain_tumor_classifier.pth   # Trained weights + class names
├── notebooks/
│   └── DataQuest26_BrainTumor.ipynb # Training notebook (run on Colab)
└── requirements.txt
```

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload
```

Server starts at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

## API

### `GET /`

Health check.

### `POST /upload-mri`

Upload a brain MRI image for classification.

- **Content-Type:** `multipart/form-data`
- **Field:** `file` (image file)
- **Response:**

```json
{
  "predicted_class": "glioma",
  "confidence": 0.8712,
  "probabilities": {
    "glioma": 0.8712,
    "meningioma": 0.0523,
    "notumor": 0.0401,
    "pituitary": 0.0364
  }
}
```

## Model details

- **Architecture:** 3-block CNN (Conv -> BatchNorm -> ReLU -> MaxPool -> Dropout) + FC classifier head.
- **Input:** 128x128 RGB, normalized to [-1, 1].
- **Classes:** `glioma`, `meningioma`, `notumor`, `pituitary` (alphabetical, matches training).
- **Test accuracy:** ~91.9% on 1,600 held-out images.
- **Trained from scratch** — no pretrained weights.
