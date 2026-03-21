import random
# import torch
# from torchvision import transforms
# from PIL import Image
# import io

# If you were loading a real PyTorch model:
# model = torch.load("best_model.pth")
# model.eval()

# class_names = ["glioma", "meningioma", "pituitary", "notumor"]

def predict_mri(image_bytes: bytes) -> dict:
    """
    MOCK Inference function.
    Reads image bytes and simulates the PyTorch model prediction.
    Replace this with actual torch inference code when the model is ready.
    """
    
    # ── EXAMPLE PYTORCH IMPLEMENTATION ──
    # image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # transform = transforms.Compose([
    #     transforms.Resize((224, 224)),
    #     transforms.ToTensor(),
    #     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    # ])
    # input_tensor = transform(image).unsqueeze(0)
    #
    # with torch.no_grad():
    #     outputs = model(input_tensor)
    #     probabilities = torch.nn.functional.softmax(outputs[0], dim=0).tolist()
    # ────────────────────────────────────
    
    # Generate mock probabilities for the 4 classes
    raw_scores = [random.random() for _ in range(4)]
    total = sum(raw_scores)
    
    # Normalize so they sum to 1.0
    probs = [round(score / total, 3) for score in raw_scores]
    
    # Fix rounding errors so they exactly sum to 1 by adjusting the max value
    diff = round(1.0 - sum(probs), 3)
    if diff != 0:
        max_idx = probs.index(max(probs))
        probs[max_idx] = round(probs[max_idx] + diff, 3)

    classes = ["glioma", "meningioma", "pituitary", "notumor"]
    prob_dict = dict(zip(classes, probs))
    
    # Keep the highest probability to determine predicted class
    predicted_class = max(prob_dict, key=prob_dict.get)
    confidence = prob_dict[predicted_class]

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "probabilities": prob_dict
    }
