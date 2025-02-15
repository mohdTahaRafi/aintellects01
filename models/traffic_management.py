# models/traffic_management.py
import numpy as np
import cv2
from ultralytics import YOLO
from datetime import datetime
import time
import asyncio
import websockets
import json

model = YOLO('yolov8n.pt')

VEHICLE_WEIGHTS = {
    'bicycle': 1,    # class_id: 1
    'car': 2,        # class_id: 2
    'motorcycle': 1, # class_id: 3
    'bus': 6,        # class_id: 5
    'truck': 4       # class_id: 7
}

def map_density_to_time(density):
    """Maps traffic density to green light duration between 10-60 seconds"""
    min_time = 10
    max_time = 60
    # Assuming max density around 50 (can be adjusted based on real-world data)
    max_density = 50
    
    green_time = min_time + (density / max_density) * (max_time - min_time)
    return int(min(max_time, max(min_time, green_time)))

async def send_detection(detection_data):
    uri = "ws://localhost:8000/ws/traffic"  # Ensure this matches the server endpoint
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(detection_data))  # Convert to JSON string

def process_frame(frame, lane_id):
    vehicle_classes = [1, 2, 3, 5, 7]  # bicycle, car, motorcycle, bus, truck
    results = model(frame)[0]
    vehicle_count = 0
    traffic_density = 0
    vehicle_counts = {k: 0 for k in VEHICLE_WEIGHTS.keys()}
    
    height, width, _ = frame.shape
    
    for result in results.boxes.data.tolist():
        x1, y1, x2, y2, score, class_id = result
        if int(class_id) in vehicle_classes:
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            class_name = model.names[int(class_id)]
            
            # Calculate weighted traffic density
            weight = VEHICLE_WEIGHTS.get(class_name, 1)
            traffic_density += weight
            vehicle_count += 1
            vehicle_counts[class_name] += 1
            
            # Draw bounding box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label = f'{class_name}: {score:.2f}'
            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Add traffic information to frame
    cv2.putText(frame, f'Lane {lane_id} - Vehicles: {vehicle_count}', (10, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    y_pos = 90
    for vehicle, count in vehicle_counts.items():
        if count > 0:
            cv2.putText(frame, f'{vehicle}: {count}', (10, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            y_pos += 30
    cv2.putText(frame, f'Density: {traffic_density}', (10, 60), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    
    return frame, vehicle_count, traffic_density, vehicle_counts

def update_traffic_lights(image, active_lane):
    """Updates traffic light indicators for all lanes"""
    height, width, _ = image.shape
    quadrant_width = width // 2
    quadrant_height = height // 2
    
    # Define positions for traffic lights in each quadrant
    positions = [
        (quadrant_width - 50, 30),           # Lane 1
        (quadrant_width - 50, quadrant_height + 30),  # Lane 2
        (width - 50, 30),                    # Lane 3
        (width - 50, quadrant_height + 30)   # Lane 4
    ]
    
    for lane in range(4):
        color = (0, 255, 0) if lane == active_lane else (0, 0, 255)
        status = "GREEN" if lane == active_lane else "RED"
        pos_x, pos_y = positions[lane]
        
        # Calculate correct position based on quadrant
        actual_x = pos_x % quadrant_width
        actual_y = pos_y % quadrant_height
        
        if lane < 2:  # Left half
            x_offset = 0
        else:  # Right half
            x_offset = quadrant_width
            
        if lane % 2 == 0:  # Top half
            y_offset = 0
        else:  # Bottom half
            y_offset = quadrant_height
            
        # Draw traffic light and status
        cv2.circle(image, (x_offset + actual_x, y_offset + actual_y), 
                  20, color, -1)
        cv2.putText(image, status, 
                   (x_offset + actual_x - 30, y_offset + actual_y + 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    return image

def main():
    # Initialize video captures
    caps = [cv2.VideoCapture(r'C:\Users\tahar\Documents\HOFv6\doORdie2\assets\sample.mp4'), 
            cv2.VideoCapture(r'C:\Users\tahar\Documents\HOFv6\doORdie2\assets\sample.mp4'), 
            cv2.VideoCapture(r'C:\Users\tahar\Documents\HOFv6\doORdie2\assets\sample.mp4'), 
            cv2.VideoCapture(r'C:\Users\tahar\Documents\HOFv6\doORdie2\assets\sample.mp4')]
    
    # Check if all video files are opened successfully
    if not all(cap.isOpened() for cap in caps):
        print("Error: Could not open all video files")
        return
    
    # Get and resize video properties
    original_width = int(caps[0].get(cv2.CAP_PROP_FRAME_WIDTH))
    original_height = int(caps[0].get(cv2.CAP_PROP_FRAME_HEIGHT))
    width = int(original_width * 0.4)
    height = int(original_height * 0.4)
    combined_image = np.zeros((height, width, 3), np.uint8)
    
    # Dictionary to store current densities for all lanes
    current_densities = {0: 0, 1: 0, 2: 0, 3: 0}

    try:
        while True:  # Main cycle loop
            remaining_lanes = [0, 1, 2, 3]  # Reset for new cycle

            # Initial frame read to get starting densities
            for i in range(4):
                ret, frame = caps[i].read()
                if not ret:
                    caps[i].set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = caps[i].read()
                frame = cv2.resize(frame, (width, height))
                _, _, density, _ = process_frame(frame, i+1)
                current_densities[i] = density

            while remaining_lanes:  # Phase loop within cycle
                # Select lane with highest current density from remaining lanes
                candidates = [(current_densities[i], i) for i in remaining_lanes]
                candidates.sort(reverse=True)
                selected_density, selected_lane = candidates[0]
                
                # Calculate green time based on current density
                green_duration = map_density_to_time(selected_density)
                start_time = time.time()
                
                # Green light phase
                while time.time() - start_time < green_duration:
                    frames = []
                    
                    # Process all lanes continuously
                    for i in range(4):
                        ret, frame = caps[i].read()
                        if not ret:
                            caps[i].set(cv2.CAP_PROP_POS_FRAMES, 0)
                            ret, frame = caps[i].read()
                        
                        # Process frame and update density
                        frame = cv2.resize(frame, (width, height))
                        processed_frame, _, density, vehicle_counts = process_frame(frame, i+1)
                        current_densities[i] = density
                        frames.append(processed_frame)

                        # Send detection data to WebSocket
                        detection_data = {
                            "lane_id": i + 1,
                            "vehicle_count": vehicle_counts,
                            "traffic_density": density,
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                        asyncio.run(send_detection(detection_data))  # Ensure async call is awaited

                    # Combine frames into grid
                    for i in range(4):
                        resized_frame = cv2.resize(frames[i], (width//2, height//2))
                        row = i // 2
                        col = i % 2
                        combined_image[row*height//2:(row+1)*height//2, 
                                    col*width//2:(col+1)*width//2] = resized_frame

                    # Update traffic light displays
                    combined_image = update_traffic_lights(combined_image, selected_lane)
                    
                    # Display timer
                    remaining_time = int(green_duration - (time.time() - start_time))
                    cv2.putText(combined_image, f'Green Time Remaining: {remaining_time}s',
                              (width//2 - 60, height - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
                    
                    # Show final output
                    # cv2.imshow('Adaptive Traffic Control System', combined_image)
                    
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        return

                # Remove lane from current cycle
                remaining_lanes.remove(selected_lane)

    finally:
        # Cleanup
        for cap in caps:
            cap.release()
        # cv2.destroyAllWindows()

if __name__ == "__main__":
    main()