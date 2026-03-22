import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from inference import predict_mri

app = FastAPI(title="NeuraScan API", description="Brain MRI Screening Prototype")

# Allow requests from the React frontend (usually runs on port 5173 or localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to the specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "NeuraScan API is running! Use /upload-mri to classify an image."}

@app.post("/upload-mri")
async def upload_mri_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Call the inference pipeline
        prediction_result = predict_mri(image_bytes)
        
        return prediction_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during inference: {str(e)}")

# --- Static Files and Catch-All (For serving React app) ---
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{catchall:path}")
    def serve_react_app(catchall: str):
        file_path = os.path.join(frontend_dist, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
