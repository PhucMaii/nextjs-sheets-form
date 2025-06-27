import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import { DynamicApexCharts } from './AreaChart';

interface CustomerSpendingChartProps {
  customersProfit: any;
  type?: 'pie' | 'bar';
}

export default function CustomerSpendingChart({
  customersProfit,
  type = 'pie',
}: CustomerSpendingChartProps) {
  const chartData = useMemo(() => {
    if (!Array.isArray(customersProfit) || customersProfit.length === 0) {
      return { series: [], labels: [] };
    }

    // Sort customers by spending and take top 5
    const topCustomers = customersProfit
      .sort((a: any, b: any) => (b?.totalSpend || 0) - (a?.totalSpend || 0))
      .slice(0, 5);

    if (type === 'pie') {
      const series = topCustomers.map((customer: any) => customer?.totalSpend || 0);
      const labels = topCustomers.map((customer: any) => customer?.customerName || 'Unknown');
      
      return { series, labels };
    } else {
      // For bar chart, we'll show spending ranges
      const spendingRanges = [
        { min: 0, max: 100, label: '$0-$100' },
        { min: 100, max: 500, label: '$100-$500' },
        { min: 500, max: 1000, label: '$500-$1K' },
        { min: 1000, max: 5000, label: '$1K-$5K' },
        { min: 5000, max: Infinity, label: '$5K+' },
      ];

      const rangeCounts = spendingRanges.map(range => {
        return customersProfit.filter((customer: any) => {
          const spending = customer?.totalSpend || 0;
          return spending >= range.min && spending < range.max;
        }).length;
      });

      const series = [{ name: 'Customers', data: rangeCounts }];
      const categories = spendingRanges.map(range => range.label);
      
      return { series, categories };
    }
  }, [customersProfit, type]);

  const options: ApexOptions = type === 'pie' ? {
    chart: {
      type: 'pie',
      height: 300,
    },
    labels: chartData.labels,
    colors: ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: '#666',
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 700,
              color: '#333',
              formatter: function (val) {
                return '$' + parseFloat(val).toFixed(2);
              },
            },
            total: {
              show: true,
              label: 'Total',
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
      position: 'bottom',
      fontSize: '12px',
      markers: {
        width: 12,
        height: 12,
        radius: 6,
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
  } : {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
      },
    },
    colors: ['#2196F3'],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Number of Customers',
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
          return val + ' customers';
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
      series={type === 'pie' ? chartData.series : chartData.series}
      type={type}
      height={300}
    />
  );
} 