from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
