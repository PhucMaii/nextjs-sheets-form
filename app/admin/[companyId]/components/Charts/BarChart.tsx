import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React from 'react';

export const DynamicApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface IProps {
  categories: string[];
  data: number[];
  title?: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
  detailedData?: any[];
  customTooltip?: boolean;
}

export default function BarChart({
  categories,
  data,
  title = 'Data',
  color = '#2196F3',
  height = 350,
  horizontal = false,
  detailedData,
  customTooltip = false,
}: IProps) {
  const series = [
    {
      name: title,
      data: data,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: horizontal ? 'bar' : 'bar',
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: '60%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
        dataLabels: {
          position: horizontal ? 'center' : 'top',
        },
      },
    },
    colors: [color],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
      formatter: function (val) {
        return '$' + parseFloat(val.toString()).toFixed(2);
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
        rotate: horizontal ? 0 : -45,
        rotateAlways: false,
        maxHeight: 60,
      },
    },
    yaxis: {
      title: {
        text: horizontal ? 'Categories' : 'Values',
        style: {
          color: '#666',
          fontSize: '14px',
        },
      },
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
        formatter: function (val) {
          return '$' + parseFloat(val.toString()).toFixed(2);
        },
      },
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
    },
    tooltip: {
      theme: 'dark',
      custom: customTooltip && detailedData ? function({ series, seriesIndex, dataPointIndex, w }) {
        const dataPoint = detailedData[dataPointIndex];
        if (!dataPoint) return '';
        
        return `
          <div class="custom-tooltip" style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${dataPoint.name}</div>
            <div style="margin-bottom: 2px;">Total Loss: $${dataPoint.totalLoss.toFixed(2)}</div>
            <div style="margin-bottom: 2px;">Quantity Lost: ${dataPoint.totalQuantity}</div>
            <div style="margin-bottom: 2px;">Reports: ${dataPoint.reports}</div>
            <div style="margin-bottom: 2px;">Loss Types: ${dataPoint.lossTypes.join(', ')}</div>
          </div>
        `;
      } : undefined,
      y: {
        formatter: function (val) {
          return '$' + val.toFixed(2);
        },
      },
    },
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.1,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 50, 100],
      },
    },
  };

  return (
    <DynamicApexCharts
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  );
} 