# Brain Tumor Detection — DataQuest 26

A machine learning model that analyzes brain MRI images and predicts whether a tumor is present or not.

Built as a hackathon submission for DataQuest 26.

---

## What It Does

Upload a brain MRI scan (image file) and the model will classify it as:
- Tumor Detected
- No Tumor Detected

The goal is to assist in early detection of brain tumors by providing a fast, automated second opinion on MRI scans.

---

## How It Works

1. The user provides a brain MRI image as input.
2. The image is preprocessed (resized, normalized) to match the model's expected format.
3. A trained ML/deep learning model runs inference on the image.
4. The model outputs a prediction — tumor or no tumor — along with a confidence score.

---

## Tech Stack

- Python
- PyTorch (deep learning framework)
- OpenCV / PIL (image preprocessing)
- NumPy
- Jupyter Notebook (for training and experimentation)

---

## Getting Started

### Prerequisites

Make sure you have Python 3.8+ installed, then install the required dependencies:

    pip install -r requirements.txt

### Running the Model

    python predict.py --image path/to/mri_scan.jpg

The output will display the prediction and confidence score in the terminal.

---

## Dataset

The model was trained on a publicly available brain MRI dataset containing labeled images of tumorous and non-tumorous scans.

---

## Results

The model achieves 91.2% accuracy on the test set, demonstrating reliable classification between tumor and non-tumor MRI scans.

---

## Team

Built by Adam Porbanderwalla, Tareq Kurdiah, Kamyar Modabber, and Nima Abbasi.

---

## Disclaimer

This tool is intended for educational and research purposes only. It is not a substitute for professional medical diagnosis.
