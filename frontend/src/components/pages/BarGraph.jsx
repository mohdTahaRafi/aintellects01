import React from 'react';
import { BarChart } from '@mui/x-charts';

const BarGraph = ({ data, colors }) => {
    const values = data.map(item => item.value);
    const labels = data.map(item => item.label);

    return (
        <BarChart
            xAxis={[{ 
                scaleType: 'band', 
                data: labels 
            }]}
            series={[{ 
                data: values,
                color: colors[0]
            }]}
            width={400}
            height={300}
        />
    );
};

export default BarGraph;