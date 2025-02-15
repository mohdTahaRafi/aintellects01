import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@mui/material';
import PieCard from './PieCard';
import BarGraph from './BarGraph';

const Dashboard = () => {
    const [detections, setDetections] = useState([]);
    const videoRef = useRef(null);

    useEffect(() => {
        // WebSocket for detections
        const ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.lane_id) {
                setDetections(prev => [data, ...prev.slice(0, 15)]);
            }
        };

        // Video stream setup
        const videoElement = videoRef.current;
        videoElement.src = 'http://localhost:8000/video_feed';

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <Card sx={{ 
                    backgroundColor: '#2f3030',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                    width: 450,
                    margin: 2
                }}>
                    <CardContent>
                        <video 
                            width="100%" 
                            height="300"
                            controls
                        >
                            <source src="https://youtu.be/dmlUpuUony4?si=oNr6vP6F9S2OQg0W" type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    </CardContent>
                </Card>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <Card sx={{ 
                    backgroundColor: '#2f3030',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    width: 450,
                    margin: 2,
                }}>
                    <CardContent>
                        <BarGraph data={detections} colors={['#7F2F1B', '#095832', '#584709', '#170503']} />
                    </CardContent>
                </Card>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                {detections.map((detection, index) => (
                    <PieCard 
                        key={index}
                        title={`LANE-${detection.lane_id}`}
                        data={Object.entries(detection.vehicle_count).map(([label, value]) => ({ label, value }))}
                        colors={['#7F2F1B', '#095832', '#584709', '#170503']}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;