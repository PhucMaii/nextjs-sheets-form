import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React from 'react';

export const DynamicApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false, // Ensure ApexCharts is not imported during SSR
});

interface IProps {
  timeSeries: string[]; // list of delivery date
  thisMonthData: number[];
  lastMonthData: number[];
}

export default function AreaChart({
  timeSeries,
  thisMonthData,
  lastMonthData,
}: IProps) {
  const series = [
    {
      name: 'Current Month',
      data: thisMonthData,
    },
    {
      name: 'Last Month',
      data: lastMonthData,
    },
  ];
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'area',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: timeSeries,
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  };

  return (
    <DynamicApexCharts
      options={options}
      series={series}
      type="line"
      height={350}
    />
  );
}
