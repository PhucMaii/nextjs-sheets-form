import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface IProps {
    timeSeries: string[]; // list of delivery date
    thisMonthData: number[];
    lastMonthData: number[];
}

export default function AreaChart({
    timeSeries,
    thisMonthData,
    lastMonthData
}: IProps) {
    console.log({timeSeries, thisMonthData, lastMonthData});
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
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={350}
    />
  );
}
