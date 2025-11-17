import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };

export const generateCostAndProfit = async (orderedItemId: number) => {
  try {
    const prisma = new PrismaClient();

    const existingItem = await prisma.orderedItems.findUnique({
      where: {
        id: orderedItemId,
      },
      include: {
        fifo: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      throw new Error(
        'Ordered item id not provided in generate cost and profit',
      );
    }

    let cost = existingItem?.cost;

    if (!cost) {
      cost = existingItem?.fifo?.price
        ? existingItem.fifo.price
        : existingItem.fifo?.vendorItem?.unit?.find(
            (unit: any) => unit.ratio === 1,
          )?.unitPrice || 0;
    }

    return { cost, profit: existingItem.price - cost };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Fail to generate cost and profit: ', error);
  }
};

export const normalizeDate = (date: Date | string) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const getTodayDate = (
  dateStyle: 'short' | 'long' | 'full' | 'medium' | undefined = 'short',
  timeStyle: 'short' | 'long' = 'long',
) => {
  const pstDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle,
    timeStyle,
    // timeStyle,
  }).format(new Date());

  const date = pstDate.split(',')[0];
  const dateSplitted = date.split('/');

  const month = dateSplitted[0].padStart(2, '0');
  const day = dateSplitted[1].padStart(2, '0');
  const year = dateSplitted[2];

  return {
    date: `${month}/${day}/20${year}`,
    time: pstDate.split(',')[1],
    dateAndTime: `${month}/${day}/20${year} ${pstDate.split(',')[1]}`,
  };
};

export const YYYYMMDDFormat = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${month.toString().padStart(2, '0')}/${day
    .toString()
    .padStart(2, '0')}/${year.toString().padStart(2, '0')}`;

  return formattedDate;
};

export const generateListOfDateString = (startDate: Date, endDate: Date) => {
  const startDateString = YYYYMMDDFormat(startDate);
  const dates = [startDateString];
  const currentDate = startDate;
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate.getTime() <= endDate.getTime()) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

async function main() {
  const PROGRAM_HEX_COLORS = [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#F44336', // Red
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FFEB3B', // Yellow
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
    '#3F51B5', // Indigo
    '#009688', // Teal
    '#FF5722', // Deep Orange
    '#8BC34A', // Light Green
    '#FFC107', // Amber
    '#673AB7', // Deep Purple
    '#CDDC39', // Lime
    '#FF4081', // Pink Accent
    '#00E676', // Green Accent
    '#18FFFF', // Cyan Accent
    '#FF6E40', // Deep Orange Accent
    '#64FFDA', // Teal Accent
    '#7C4DFF', // Deep Purple Accent
    '#FFD740', // Amber Accent
    '#1DE9B6', // Teal Accent 2
    '#B388FF', // Deep Purple Accent 2
    '#6FFFE9', // Cyan Accent 2
    '#FF9100', // Orange Accent
    '#E64A19', // Deep Orange Dark
    '#5E35B1', // Deep Purple Dark
    '#00796B', // Teal Dark
    '#C2185B', // Pink Dark
    '#303F9F', // Indigo Dark
    '#388E3C', // Green Dark
    '#F57C00', // Orange Dark
    '#7B1FA2', // Purple Dark
    '#0288D1', // Light Blue Dark
    '#D32F2F', // Red Dark
    '#1976D2', // Blue Dark
    '#455A64', // Blue Grey Dark
    '#689F38', // Light Green Dark
    '#FBC02D', // Yellow Dark
    '#512DA8', // Deep Purple Dark 2
    '#C51162', // Pink Dark 2
    '#283593', // Indigo Dark 2
    '#2E7D32', // Green Dark 2
    '#E65100', // Orange Dark 2
    '#6A1B9A', // Purple Dark 2
    '#01579B', // Light Blue Dark 2
    '#B71C1C', // Red Dark 2
    '#0D47A1', // Blue Dark 2
    '#263238', // Blue Grey Dark 2
    '#558B2F', // Light Green Dark 2
    '#F57F17', // Yellow Dark 2
    '#4A148C', // Deep Purple Dark 3
    '#004D40', // Teal Dark 3
    '#880E4F', // Pink Dark 3
    '#1A237E', // Indigo Dark 3
    '#1B5E20', // Green Dark 3
    '#BF360C', // Orange Dark 3
    '#0277BD', // Light Blue
    '#D50000', // Red Accent
    '#2962FF', // Blue Accent
    '#00BFA5', // Teal Accent 3
    '#AA00FF', // Purple Accent
    '#FF1744', // Red Accent 2
    '#304FFE', // Indigo Accent
    '#00C853', // Green Accent 2
    '#FF6D00', // Orange Accent 2
    '#6200EA', // Deep Purple Accent 3
    '#00E5FF', // Cyan Accent 3
    '#76FF03', // Lime Accent
    '#FFD600', // Yellow Accent
    '#FF3D00', // Deep Orange Accent 2
    '#651FFF', // Deep Purple Accent 4
    '#1CE9B6', // Teal Accent 4
    '#00B8D4', // Cyan Accent 4
    '#FF6F00', // Amber Accent 2
    '#E040FB', // Purple Accent 2
    '#536DFE', // Indigo Accent 2
    '#00ACC1', // Cyan Dark
    '#5C6BC0', // Indigo Light
    '#26A69A', // Teal Light
    '#42A5F5', // Blue Light
    '#66BB6A', // Green Light
    '#AB47BC', // Purple Light
    '#EC407A', // Pink Light
    '#EF5350', // Red Light
    '#FFA726', // Orange Light
    '#FFCA28', // Yellow Light
    '#26C6DA', // Cyan Light
    '#7E57C2', // Deep Purple Light
    '#78909C', // Blue Grey Light
    '#8D6E63', // Brown Light
  ];

  const waterPrograms = await prisma.waterProgram.findMany({
    where: {
      companyId: 1,
    },
  });
  
  for (const waterProgram of waterPrograms) {
    await prisma.waterProgram.update({
      where: { id: waterProgram.id },
      data: { hexColor: PROGRAM_HEX_COLORS[Math.floor(Math.random() * PROGRAM_HEX_COLORS.length)] },
    });
  }
}


main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
