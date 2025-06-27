import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import { DynamicApexCharts } from './AreaChart';

interface IProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
}

export default function DonutChart({
  data,
  title = 'Data Distribution',
  height = 300,
  showLegend = true,
}: IProps) {
  const series = useMemo(() => {
    return data.map((item) => item.value);
  }, [data]);

  const colors = useMemo(() => {
    return data.map((item) => item.color || '#2196F3');
  }, [data]);

  const labels = useMemo(() => {
    return data.map((item) => item.label);
  }, [data]);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: height,
    },
    labels: labels,
    colors: colors,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#666',
            },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: 700,
              color: '#333',
              formatter: function (val) {
                return '$' + parseFloat(val).toFixed(2);
              },
            },
            total: {
              show: true,
              label: title,
              fontSize: '14px',
              fontWeight: 600,
              color: '#666',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return '$' + total.toFixed(2);
              },
            },
          },
        },
      },
    },
    legend: {
      show: showLegend,
      position: 'bottom',
      fontSize: '12px',
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          return '$' + val.toFixed(2);
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250,
          },
          legend: {
            position: 'bottom',
            fontSize: '10px',
          },
        },
      },
    ],
  };

  return (
    <DynamicApexCharts
      options={options}
      series={series}
      type="donut"
      height={height}
    />
  );
} 