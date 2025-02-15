import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TrafficCard = ({ lane }) => {
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState(lane.remaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card sx={{ 
      backgroundColor: '#c1b9b9',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      width: '450px',
      margin: '1rem'
    }}>
      <CardContent>
        <div style={{ padding: '1rem' }}>
          <h3>{lane.crossingName}</h3>
          <p><strong>Lane Number:</strong> {lane.laneNumber}</p>
          <p><strong>Location:</strong> {lane.location}</p>
          <p style={{ color: '#ff4444' }}>
            <strong>Remaining Time:</strong> {remainingTime} sec
          </p>
          <img
            src={lane.image}
            alt="Crossing"
            style={{ 
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px',
              marginTop: '1rem'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '1rem' 
          }}>
            <Button 
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                backgroundColor: '#095832',
                width: '200px',
                '&:hover': {
                  backgroundColor: '#064023'
                }
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TrafficControl = () => {
  const [lanes, setLanes] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.lane_id) {
        setLanes(prev => {
          const updatedLanes = prev.filter(lane => lane.lane_id !== data.lane_id);
          return [data, ...updatedLanes];
        });
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>Traffic Control</h2>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '2rem',
        padding: '1rem',
        justifyContent: 'center'
      }}>
        {lanes.map(lane => (
          <TrafficCard 
            key={lane.lane_id} 
            lane={lane} 
          />
        ))}
      </div>
    </div>
  );
};

export default TrafficControl;