# models/suspicious_activity.py
import cv2
import torch
from ultralytics import YOLO
import requests
from datetime import datetime
import time
import asyncio
import websockets
import json

model = YOLO("assets/yolov8x.pt")
labels = {0: "Person", 1: "Fire", 2: "Weapon", 3: "Accident"}

async def send_detection(detection_data):
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(detection_data))  # Convert to JSON string

def process_video():
    cap = cv2.VideoCapture(r"C:\Users\tahar\Documents\HOFv6\doORdie2\assets\bikecrash.mp4")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = cv2.resize(frame, (640, 640))

        results = model(frame, iou=0.4)

        for result in results:
            for box in result.boxes:
                conf = box.conf[0].item()
                cls = int(box.cls[0].item())

                if cls in labels and conf > 0.7:
                    detection_data = {
                        "type": "suspicious",
                        "object": labels[cls],
                        "confidence": conf,
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    asyncio.run(send_detection(detection_data))
                    time.sleep(0.1)

    cap.release()

if __name__ == "__main__":
    process_video()