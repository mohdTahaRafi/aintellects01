import React from 'react';
import { PieChart } from '@mui/x-charts';

const defaultColors = ['#7F2F1B', '#095832', '#584709', '#170503'];

const Lane1Pie = ({ data, colors = defaultColors }) => {
    return (
        <PieChart
            series={[{
                data: data,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30 },
                valueFormatter: (value) => `${value}`,
                arcLabel: null,
                highlight: true,
                innerRadius: 30,
                outerRadius: 150,
                paddingAngle: 2,
                cornerRadius: 5,
            }]}
            tooltip={{
                trigger: 'item',
                visible: true,
                formatter: (params) => `${params.data.label}: ${params.data.value}`
            }}
            colors={colors}
            width={400}
            height={400}
        />
    );
};

export default Lane1Pie;