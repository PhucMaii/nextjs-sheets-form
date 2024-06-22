import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import { DynamicApexCharts } from './AreaChart';

interface IProps {
  overviewData: any;
}

export default function PieChart({ overviewData }: IProps) {
  const unpaidPercentage = useMemo(() => {
    if (!overviewData) {
      return 0;
    }

    return (
      Math.round(
        (overviewData.unpaidAmount / overviewData.revenue) * 100 * 100,
      ) / 100
    );
  }, [overviewData]);

  const paidPercentage = useMemo(() => {
    return Math.round((100 - unpaidPercentage) * 100) / 100;
  }, [unpaidPercentage]);

  const series = [paidPercentage, unpaidPercentage];
  const options: ApexOptions = {
    chart: {
      width: 405,
      type: 'pie',
    },
    labels: ['Paid', 'Unpaid'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };
  return (
    <DynamicApexCharts
      options={options}
      series={series}
      type="pie"
      height={405}
    />
  );
}
