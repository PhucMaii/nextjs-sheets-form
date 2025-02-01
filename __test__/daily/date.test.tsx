import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '@/pages/api/utils/date';

describe('Date', () => {
  test('Date', () => {
    const startDate = new Date('2024-12-01T08:00:00.000Z');
    const endDate = new Date('2024-12-08T08:00:00.000Z');

    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);

    console.log({
      normalizedStartDate,
      normalizedEndDate,
    });

    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );
    console.log(listOfDateString, 'list of date string');

    expect(listOfDateString).toEqual([
      '12/01/2024',
      '12/02/2024',
      '12/03/2024',
      '12/04/2024',
      '12/05/2024',
      '12/06/2024',
      '12/07/2024',
      '12/08/2024',
    ]);
  });
});
