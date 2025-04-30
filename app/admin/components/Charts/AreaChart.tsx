import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React from 'react';

export const DynamicApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false, // Ensure ApexCharts is not imported during SSR
});

interface IProps {
  timeSeries: string[]; // list of delivery date
  thisMonthData: number[];
  lastMonthData?: number[];
}

export default function AreaChart({
  timeSeries,
  thisMonthData,
  lastMonthData,
}: IProps) {
  const series = lastMonthData
    ? [
        {
          name: 'Current Month',
          data: thisMonthData,
        },
        {
          name: 'Last Month',
          data: lastMonthData,
        },
      ]
    : [
        {
          name: 'Current Month',
          data: thisMonthData,
        },
      ];

  console.log(timeSeries);
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      // stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      type: 'datetime',
      categories: timeSeries,
    },
    yaxis: {
      title: {
        text: 'Revenue',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$ ' + val;
        },
      },
    },
  };

  return (
    <DynamicApexCharts
      options={options}
      series={series}
      type="bar"
      height={350}
    />
  );
}
