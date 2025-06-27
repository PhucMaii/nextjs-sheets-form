import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React from 'react';

export const DynamicApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface IProps {
  timeSeries: string[];
  data: number[];
  title?: string;
  color?: string;
  height?: number;
}

export default function LineChart({
  timeSeries,
  data,
  title = 'Data',
  color = '#2196F3',
  height = 350,
}: IProps) {
  const series = [
    {
      name: title,
      data: data,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: height,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: [color],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'datetime',
      categories: timeSeries,
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
        formatter: function (val) {
          return '$' + val.toFixed(2);
        },
      },
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          return '$' + val.toFixed(2);
        },
      },
    },
    markers: {
      size: 4,
      colors: [color],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
  };

  return (
    <DynamicApexCharts
      options={options}
      series={series}
      type="line"
      height={height}
    />
  );
} 