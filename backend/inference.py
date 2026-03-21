import io
from pathlib import Path

import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

from model import BrainTumorCNN

# ── Load model once at import time (reused across requests) ────────────

_CHECKPOINT_PATH = Path(__file__).resolve().parent / "models" / "brain_tumor_classifier.pth"

_checkpoint = torch.load(_CHECKPOINT_PATH, map_location="cpu", weights_only=False)
_class_names: list[str] = _checkpoint["class_names"]

_model = BrainTumorCNN(num_classes=len(_class_names))
_model.load_state_dict(_checkpoint["model_state_dict"])
_model.eval()

# Must match training: 128×128, normalize to [-1, 1]
_transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])


def predict_mri(image_bytes: bytes) -> dict:
    """Run the trained BrainTumorCNN on raw image bytes and return predictions."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = _transform(image).unsqueeze(0)  # (1, 3, 128, 128)

    with torch.no_grad():
        logits = _model(input_tensor)
        probs = F.softmax(logits[0], dim=0).tolist()

    prob_dict = {name: round(p, 4) for name, p in zip(_class_names, probs)}
    predicted_class = max(prob_dict, key=prob_dict.get)

    return {
        "predicted_class": predicted_class,
        "confidence": prob_dict[predicted_class],
        "probabilities": prob_dict,
    }
