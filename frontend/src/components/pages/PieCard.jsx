import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import Lane1Pie from './lane1pie';

const PieCard = ({ title, data, colors }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
        <Card 
            sx={{ 
                width: 450, 
                margin: 2, 
                backgroundColor: '#2f3030', 
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' 
            }}
        >
            <CardContent>
                <Typography variant="h6" component="div" color="white">
                    {title} - Total: {total}
                </Typography>
                <Lane1Pie data={data} colors={colors} />
            </CardContent>
        </Card>
    );
};

export default PieCard;