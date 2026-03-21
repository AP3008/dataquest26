# Frontend Handoff — NeuraScan

Everything you need to connect the React frontend to the backend API.

## 1. Running the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs (Swagger) at `http://localhost:8000/docs`.

CORS is open (`*`), so requests from `http://localhost:5173` (Vite dev server) will work out of the box.

## 2. Endpoint

### `POST /upload-mri`

Accepts a brain MRI image and returns the model's classification.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `file`
- Value: an image file (JPEG, PNG, etc.)

**Example fetch call:**

```typescript
const formData = new FormData();
formData.append("file", selectedFile); // File from <input type="file">

const res = await fetch("http://localhost:8000/upload-mri", {
  method: "POST",
  body: formData,
});
const data = await res.json();
```

**Response (200 OK):**

```json
{
  "predicted_class": "meningioma",
  "confidence": 0.9231,
  "probabilities": {
    "glioma": 0.0312,
    "meningioma": 0.9231,
    "notumor": 0.0198,
    "pituitary": 0.0259
  }
}
```

**Error (400):** returned when the uploaded file is not an image.

```json
{ "detail": "File provided is not an image." }
```

## 3. Response fields

| Field | Type | Description |
|-------|------|-------------|
| `predicted_class` | string | One of: `glioma`, `meningioma`, `notumor`, `pituitary` |
| `confidence` | float | Probability of the predicted class (0–1) |
| `probabilities` | object | Per-class probabilities, keys are class names, values sum to ~1.0 |

## 4. Using probabilities for the 3D visualization

The `probabilities` object gives you a score for each of the four classes. You can use these to drive the 3D brain visualization — for example:

- Highlight the predicted region on the brain model.
- Use confidence to control opacity or color intensity.
- Show a breakdown bar/chart alongside the 3D view.

## 5. Class descriptions

| Class | Meaning |
|-------|---------|
| `glioma` | Tumor originating in glial cells |
| `meningioma` | Tumor on the membranes covering the brain |
| `notumor` | Healthy brain scan, no abnormalities |
| `pituitary` | Tumor in the pituitary gland at the base of the brain |

## 6. Health check

`GET /` returns:

```json
{ "message": "NeuraScan API is running! Use /upload-mri to classify an image." }
```

Use this to verify the backend is up before enabling the upload button.
