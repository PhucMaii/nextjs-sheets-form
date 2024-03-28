import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('maiphuc0102', 12);

  const users = [
    // {
    //   clientId: '00100',
    //   clientName: `Pho d'lite - 6717 Randolph Ave, Burnaby`,
    //   sheetName: '00100',
    //   deliveryAddress: '2-4415 Skyline Dr, Burnaby, BC V5C 5Y1',
    //   contactNumber: '17783796188',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00101',
    //   clientName: 'Phở Hồng Vietnamese Restaurant',
    //   sheetName: '00101',
    //   deliveryAddress: '5975 Kingsway, Burnaby, BC V5J 1H1',
    //   contactNumber: '16044549727',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00102',
    //   clientName: 'Pho Century Fine Vietnamese Cuisine',
    //   sheetName: '00102',
    //   deliveryAddress: '6701 Kingsway, Burnaby, BC V5E 1E4',
    //   contactNumber: '16045445028',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00103',
    //   clientName: 'B&D Authentic Viet Cuisine',
    //   sheetName: '00103',
    //   deliveryAddress: '7090 Kingsway, Burnaby, BC V5E 1E7',
    //   contactNumber: '16045536688',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00104',
    //   clientName: 'Bún Riêu Phương Nam',
    //   sheetName: '00104',
    //   deliveryAddress: '7405 Edmonds St, Burnaby, BC V3N 1B1',
    //   contactNumber: '16045220500',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00105',
    //   clientName: 'Nao Sushi (7060 Kingsway, Burnaby)',
    //   sheetName: '00105',
    //   deliveryAddress: '7060 Kingsway, Burnaby, BC V5E 1E5',
    //   contactNumber: '16045213131',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00106',
    //   clientName: 'GT II Express',
    //   sheetName: '00106',
    //   deliveryAddress: '7515 Market Crossing #105, Burnaby, BC V5J 0A3',
    //   contactNumber: '16045598688',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00107',
    //   clientName: `Little Minh's Kitchen`,
    //   sheetName: '00107',
    //   deliveryAddress: '7533 Market Crossing, Burnaby, BC V5J 0A3',
    //   contactNumber: '17789286668',
    //   categoryId: 5,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00108',
    //   clientName: 'Koya Japan',
    //   sheetName: '00108',
    //   deliveryAddress: 'FC9, 4820 Kingsway #329, Burnaby, BC V5H 4P1',
    //   contactNumber: '16044337764',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00109',
    //   clientName: 'Thai Express Restaurant Burnaby',
    //   sheetName: '00109',
    //   deliveryAddress: 'Metropolis at Metrotown, 4820 Kingsway, Burnaby, BC V5H 4P1',
    //   contactNumber: '17783797131',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00110',
    //   clientName: 'Pho 24 express',
    //   sheetName: '00110',
    //   deliveryAddress: '4250 Kingsway, Burnaby, BC V5H 1Z5',
    //   contactNumber: '16045689185',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00111',
    //   clientName: 'Tasty Wok',
    //   sheetName: '00111',
    //   deliveryAddress: '7180 Kerr St #110, Vancouver, BC V5S 4W2',
    //   contactNumber: '16043277720',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00112',
    //   clientName: 'Pho Thai Ha',
    //   sheetName: '00112',
    //   deliveryAddress: '2653 E 49th Ave, Vancouver, BC V5S 1J9',
    //   contactNumber: '16044284998',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00113',
    //   clientName: 'Thai Son Restaurant (Victoria)',
    //   sheetName: '00113',
    //   deliveryAddress: '6471 Victoria Dr, Vancouver, BC V5P 3X7',
    //   contactNumber: '16043256436',
    //   categoryId: 4,
    //   password,
    //   role: 'client',
    // },
    // {
    //   clientId: '00114',
    //   clientName: 'Doli Supermarket Ltd.',
    //   sheetName: '00114',
    //   deliveryAddress: '5818 Victoria Dr, Vancouver, BC V5P 3W9',
    //   contactNumber: '16043250899',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00115',
    //   clientName: 'Produce Marketplace',
    //   sheetName: '00115',
    //   deliveryAddress: '6398 Fraser St, Vancouver, BC V5W 3A4',
    //   contactNumber: '16043211089',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00116',
    //   clientName: 'Bon Cafe',
    //   sheetName: '00116',
    //   deliveryAddress: '4909 Main St, Vancouver, BC V5W 2R2',
    //   contactNumber: '16043251199',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00117',
    //   clientName: 'Thai Son Restaurant (Marine Dr, Vancouver)',
    //   sheetName: '00117',
    //   deliveryAddress: '1450 SW Marine Dr, Vancouver, BC V6P 5Z9',
    //   contactNumber: '16045596436',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00118',
    //   clientName: 'Three Dolphins Wholesale Ltd.',
    //   sheetName: '00118',
    //   deliveryAddress: '2051 No 6 Rd, Richmond, BC V6V 1P3',
    //   contactNumber: '16048767666',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00119',
    //   clientName: 'Thai Son Restaurant (Richmond)',
    //   sheetName: '00119',
    //   deliveryAddress: '4791 Mcclelland Rd, Richmond, BC V6X 1C5',
    //   contactNumber: '16042786436',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00120',
    //   clientName: 'Grand Value Asian Supermarket',
    //   sheetName: '00120',
    //   deliveryAddress: '8251 Westminster Hwy Unit 20, Richmond, BC V6X 1A7',
    //   contactNumber: '16042739877',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00121',
    //   clientName: 'PHO M & K (8191 Saba Rd #150, Richmond)',
    //   sheetName: '00121',
    //   deliveryAddress: '8191 Saba Rd #150, Richmond, BC V6Y 4B4',
    //   contactNumber: '17782977666',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00122',
    //   clientName: 'Koryo Korean Barbeque',
    //   sheetName: '00122',
    //   deliveryAddress: '6551 No. 3 Rd #2460, Richmond, BC V6Y 2B6',
    //   contactNumber: '16042858432',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00123',
    //   clientName: 'Vina Vietnamese',
    //   sheetName: '00123',
    //   deliveryAddress: '6551 No. 3 Rd, Richmond, BC V6Y 4A8',
    //   contactNumber: '16042732475',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00124',
    //   clientName: 'Kung Pao Wok',
    //   sheetName: '00124',
    //   deliveryAddress: 'Unit 1538 - 6551 #3 Rd, Richmond, BC V6Y 2B5',
    //   contactNumber: '16042768871',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00125',
    //   clientName: 'Thai Express Restaurant Richmond',
    //   sheetName: '00125',
    //   deliveryAddress: 'CF Richmond Centre, 6551 No. 3 Rd, Richmond, BC V6Y 2B6',
    //   contactNumber: '16042708323',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00126',
    //   clientName: 'Villa Vietnamese',
    //   sheetName: '00126',
    //   deliveryAddress: '5300 No. 3 Rd, Richmond, BC V6X 2C7',
    //   contactNumber: '16042851525',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00127',
    //   clientName: 'Baoguette Vietnamese Bistro',
    //   sheetName: '00127',
    //   deliveryAddress: '4800 No. 3 Rd #105, Richmond, BC V6X 3A6',
    //   contactNumber: '16042795168',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00128',
    //   clientName: 'On On Wonton House',
    //   sheetName: '00128',
    //   deliveryAddress: '5640 Kingsway, Burnaby, BC V5H 2G5',
    //   contactNumber: '16044374000',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00129',
    //   clientName: 'Mr. Ho Wonton House',
    //   sheetName: '00129',
    //   deliveryAddress: '6731 Kingsway, Burnaby, BC V5E 1E4',
    //   contactNumber: '16045406746',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00130',
    //   clientName: 'Henlong Market',
    //   sheetName: '00130',
    //   deliveryAddress: '14351 104 Ave, Surrey, BC V3T 1Y1',
    //   contactNumber: '16045858588',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00131',
    //   clientName: 'Pho Hong # 2 (10322 Whalley Blvd, Surrey)',
    //   sheetName: '00131',
    //   deliveryAddress: '10322 Whalley Blvd, Surrey',
    //   contactNumber: '16044960809',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00132',
    //   clientName: 'Arirang Korean Hot Pot',
    //   sheetName: '00132',
    //   deliveryAddress: '14916 104 Ave, Surrey, BC V3R 1M8',
    //   contactNumber: '16045820020',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00133',
    //   clientName: 'Fortune Wok (610 6th St, New Westminster)',
    //   sheetName: '00133',
    //   deliveryAddress: '610 6th St, New Westminster, BC V3L 5V1',
    //   contactNumber: '16045226198',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00134',
    //   clientName: 'Chong Lee Market',
    //   sheetName: '00134',
    //   deliveryAddress: '6399 Victoria Dr, Vancouver, BC V5P 3X5',
    //   contactNumber: '16043238133',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00135',
    //   clientName: 'Consumer Food Market',
    //   sheetName: '00135',
    //   deliveryAddress: '5891 Victoria Dr, Vancouver, BC V5P 3W5',
    //   contactNumber: '16046209266',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00136',
    //   clientName: 'Osoyoos Produce',
    //   sheetName: '00136',
    //   deliveryAddress: '5723 Victoria Dr, Vancouver, BC V5P 3W5',
    //   contactNumber: '16045687122',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00137',
    //   clientName: 'La Maison Da Nang',
    //   sheetName: '00137',
    //   deliveryAddress: '5195 Victoria Dr, Vancouver, BC V5P 3V1',
    //   contactNumber: '16047322182',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00138',
    //   clientName: 'Bun Cha Ca Hoang Yen',
    //   sheetName: '00138',
    //   deliveryAddress: '5155 Victoria Dr, Vancouver, BC V5P 3V1',
    //   contactNumber: '16043212711',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00139',
    //   clientName: 'Cafe Dang Anh',
    //   sheetName: '00139',
    //   deliveryAddress: '5186 Victoria Dr #1C9, Vancouver, BC V5P 3V2',
    //   contactNumber: '17783797977',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00140',
    //   clientName: 'Viet Mama Cafe',
    //   sheetName: '00140',
    //   deliveryAddress: '5118 Victoria Dr, Vancouver, BC V5P 3V2',
    //   contactNumber: '17789889257',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00141',
    //   clientName: 'Hủ Tiếu Hồng Phát',
    //   sheetName: '00141',
    //   deliveryAddress: '5076 Victoria Dr, Vancouver, BC V5P 3T8',
    //   contactNumber: '16043220222',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00142',
    //   clientName: 'Hội An Café',
    //   sheetName: '00142',
    //   deliveryAddress: '5002 Victoria Dr, Vancouver, BC V5P 3T8',
    //   contactNumber: '16045669283',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00143',
    //   clientName: 'Chau Veggie Express',
    //   sheetName: '00143',
    //   deliveryAddress: '5052 Victoria Dr, Vancouver, BC V5P 3T8',
    //   contactNumber: '16045689508',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00144',
    //   clientName: 'Mỹ Châu Restaurant',
    //   sheetName: '00144',
    //   deliveryAddress: '1715 Kingsway, Vancouver, BC V5N 2S4',
    //   contactNumber: '16048746880',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00145',
    //   clientName: 'My Tho Supermarket',
    //   sheetName: '00145',
    //   deliveryAddress: '1106 Kingsway, Vancouver, BC V5V 3C8',
    //   contactNumber: '16048792718',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00146',
    //   clientName: 'Thu Hien Deli & Sandwich Shop',
    //   sheetName: '00146',
    //   deliveryAddress: '1388 Kingsway, Vancouver, BC V5V 3E4',
    //   contactNumber: '16048749243',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00147',
    //   clientName: 'Pho Duy Restaurant',
    //   sheetName: '00147',
    //   deliveryAddress: '1996 Kingsway, Vancouver, BC V5N 2S9',
    //   contactNumber: '16048759740',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00148',
    //   clientName: 'Veggiebowl',
    //   sheetName: '00148',
    //   deliveryAddress: '2222 Kingsway, Vancouver, BC V5N 2T7',
    //   contactNumber: '16046207672',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00149',
    //   clientName: 'Cafe Xu Hue',
    //   sheetName: '00149',
    //   deliveryAddress: '2226 Kingsway, Vancouver, BC V5N 2T7',
    //   contactNumber: '16044549940',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00150',
    //   clientName: 'Got Phở Thiên Kim',
    //   sheetName: '00150',
    //   deliveryAddress: '2523 Nanaimo St, Vancouver, BC V5N 5E6',
    //   contactNumber: '16042538239',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00151',
    //   clientName: 'Song Huong Restaurant',
    //   sheetName: '00151',
    //   deliveryAddress: '1613 Nanaimo St, Vancouver, BC V5L 4T9',
    //   contactNumber: '16045681196',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00152',
    //   clientName: 'Thai Son Restaurant',
    //   sheetName: '00152',
    //   deliveryAddress: '373 E Broadway, Vancouver, BC V5T 1W6',
    //   contactNumber: '16048756436',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00153',
    //   clientName: 'Mali Thai Restaurant',
    //   sheetName: '00153',
    //   deliveryAddress: '2710 Main St, Vancouver, BC V5T 3E8',
    //   contactNumber: '16048793929',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00154',
    //   clientName: 'Pho Goodness (Main Street)',
    //   sheetName: '00154',
    //   deliveryAddress: '3079 Main St, Vancouver, BC V5T 3G6',
    //   contactNumber: '16046207727',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00155',
    //   clientName: 'Pho Quynh Express - 89 W 2nd Ave',
    //   sheetName: '00155',
    //   deliveryAddress: '89 W 2nd Ave, Vancouver, BC V5Y 1B3',
    //   contactNumber: '16046205628',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00156',
    //   clientName: 'Pho Quynh Express - 1691 Main St',
    //   sheetName: '00156',
    //   deliveryAddress: '1691 Main St, Vancouver, BC V6A 2W5',
    //   contactNumber: '16044233147',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00157',
    //   clientName: 'Vina Vietnamese',
    //   sheetName: '00157',
    //   deliveryAddress: '2002 Park Royal S FC05, West Vancouver, BC V7T 2W4',
    //   contactNumber: '16049130384',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00158',
    //   clientName: 'Thaigo',
    //   sheetName: '00158',
    //   deliveryAddress: '2002 Park Royal S FC01, West Vancouver, BC V7T 1A1',
    //   contactNumber: '16042812080',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00159',
    //   clientName: 'Fortune Wok',
    //   sheetName: '00159',
    //   deliveryAddress: '2002 Park Royal S, West Vancouver, BC V7T 2W4',
    //   contactNumber: '16049250773',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00160',
    //   clientName: 'Pho Garden',
    //   sheetName: '00160',
    //   deliveryAddress: '1469 Marine Dr, North Vancouver, BC V7P 1T7',
    //   contactNumber: '16047701044',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00161',
    //   clientName: 'Sushi Man',
    //   sheetName: '00161',
    //   deliveryAddress: '1307 Marine Dr, North Vancouver, BC V7P 3E5',
    //   contactNumber: '16049908821',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00162',
    //   clientName: 'Coral Court Chinese Restaurant',
    //   sheetName: '00162',
    //   deliveryAddress: '137 2nd St E, North Vancouver, BC V7L 1C2',
    //   contactNumber: '16049873303',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00163',
    //   clientName: 'South Castle Korean Restaurant',
    //   sheetName: '00163',
    //   deliveryAddress: '141 2nd St E, North Vancouver, BC V7L 1C2',
    //   contactNumber: '16049600612',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00164',
    //   clientName: 'Golden Pearl Restaurant',
    //   sheetName: '00164',
    //   deliveryAddress: '333 Brooksbank Ave #128, North Vancouver, BC V7J 3S8',
    //   contactNumber: '16049863733',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00165',
    //   clientName: 'Phở Pasteur Restaurant',
    //   sheetName: '00165',
    //   deliveryAddress: '3853 Hastings St, Burnaby, BC V5C 2H7',
    //   contactNumber: '16046208906',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00166',
    //   clientName: 'Brokenrice Vietnamese Restaurant',
    //   sheetName: '00166',
    //   deliveryAddress: '4088 Hastings St, Burnaby, BC V5C 2H9',
    //   contactNumber: '16045583838',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00167',
    //   clientName: 'Pho Mr. Do',
    //   sheetName: '00167',
    //   deliveryAddress: '4532 Hastings St, Burnaby, BC V5C 2K4',
    //   contactNumber: '16046203795',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00168',
    //   clientName: 'Take Sushi Japanese Restaurant',
    //   sheetName: '00168',
    //   deliveryAddress: '4528 Hastings St, Burnaby, BC V5C 2K6',
    //   contactNumber: '16042917241',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00169',
    //   clientName: 'Sooda Korean BBQ',
    //   sheetName: '00169',
    //   deliveryAddress: '4455 Lougheed Hwy., Burnaby, BC V5C 3Z2',
    //   contactNumber: '16044289227',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00170',
    //   clientName: "Sol Lee's Korean Restaurant",
    //   sheetName: '00170',
    //   deliveryAddress: '329 North Rd Unit 550, Coquitlam, BC V3K 3V8',
    //   contactNumber: '16049318460',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00171',
    //   clientName: 'Bukchigo Jangguchigo',
    //   sheetName: '00171',
    //   deliveryAddress: '341 North Rd, Coquitlam, BC V3K 3V8',
    //   contactNumber: '16049317400',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00172',
    //   clientName: 'Insadong Korean BBQ Restaurant',
    //   sheetName: '00172',
    //   deliveryAddress: '403 North Rd #301, Coquitlam, BC V3K 3V9',
    //   contactNumber: '16049363778',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00173',
    //   clientName: "Joe's Farm Market",
    //   sheetName: '00173',
    //   deliveryAddress: '9612 Cameron St, Burnaby, BC V3J 1M2',
    //   contactNumber: '16044219888',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00174',
    //   clientName: 'Mika Sushi',
    //   sheetName: '00174',
    //   deliveryAddress: '1049 Ridgeway Ave, Coquitlam, BC V3J 1S6',
    //   contactNumber: '16044924130',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00175',
    //   clientName: 'South Castle Korean Restaurant',
    //   sheetName: '00175',
    //   deliveryAddress: '1126 Austin Ave, Coquitlam, BC V3K 3P5',
    //   contactNumber: '16049394000',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00176',
    //   clientName: 'Seoul Trading Corporation',
    //   sheetName: '00176',
    //   deliveryAddress: '1560 Broadway St #1, Port Coquitlam, BC V3C 6E6',
    //   contactNumber: '16044687790',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00177',
    //   clientName: 'Phở Tàu Bay - 148 street',
    //   sheetName: '00177',
    //   deliveryAddress: '10782 148 St, Surrey, BC V3R 1V1',
    //   contactNumber: '16045851833',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00182',
    //   clientName: 'Kung Pao Wok',
    //   sheetName: '00182',
    //   deliveryAddress: '10355 152 St Unit 1411, Surrey, BC V3R 7C1',
    //   contactNumber: '16045897938',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00183',
    //   clientName: 'Kim Hoang Restaurant',
    //   sheetName: '00183',
    //   deliveryAddress: '10330 152 St, Surrey, BC V3R 4G8',
    //   contactNumber: '16049518382',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00184',
    //   clientName: "Chan's kitchen",
    //   sheetName: '00184',
    //   deliveryAddress: '15277 100 Ave, Surrey, BC V3R 8X2',
    //   contactNumber: '16045888807',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00185',
    //   clientName: 'Sashimi & Sushi Express',
    //   sheetName: '00185',
    //   deliveryAddress: '15277 100 Ave, Surrey, BC V3R 8X2',
    //   contactNumber: '16045841190',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00186',
    //   clientName: 'Lotte Giants Market Langley',
    //   sheetName: '00186',
    //   deliveryAddress: '20378 88 Ave, Langley Twp, BC V1M 2Y4',
    //   contactNumber: '16043713766',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00187',
    //   clientName: "Mai's Vietnamese Restaurant",
    //   sheetName: '00187',
    //   deliveryAddress: '20378 88 Ave #103, Langley Twp, BC V1M 2Y4',
    //   contactNumber: '16048829100',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00188',
    //   clientName: 'Phở Triple 3',
    //   sheetName: '00188',
    //   deliveryAddress: '20159 88 Ave #106C, Langley Twp, BC V1M 0A4',
    //   contactNumber: '17782988800',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00189',
    //   clientName: 'Thai Express Restaurant Langley',
    //   sheetName: '00189',
    //   deliveryAddress: '19705 Fraser Hwy, Langley Twp, BC V3A 7E9',
    //   contactNumber: '16044272247',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00190',
    //   clientName: 'Noodle Island',
    //   sheetName: '00190',
    //   deliveryAddress: '15988 Fraser Hwy #302, Surrey, BC V4N 0X8',
    //   contactNumber: '16045916528',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00191',
    //   clientName: 'On Yuen Chinese Restaurant',
    //   sheetName: '00191',
    //   deliveryAddress: '9014 152 St, Surrey, BC V3R 4E7',
    //   contactNumber: '16045833238',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00192',
    //   clientName: "Fraser Joe's Farm Market Ltd",
    //   sheetName: '00192',
    //   deliveryAddress: '8932 152 St, Surrey, BC V3R 4E4',
    //   contactNumber: '16049301151',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00193',
    //   clientName: 'Pho Newton',
    //   sheetName: '00193',
    //   deliveryAddress: '7488 King George Blvd, Surrey, BC V3W 0H9',
    //   contactNumber: '17785931828',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00194',
    //   clientName: 'Phở Tàu Bay - 72 ave',
    //   sheetName: '00194',
    //   deliveryAddress: '7322 King George Blvd, Surrey, BC V3W 5A5',
    //   contactNumber: '16045031221',
    //   categoryId: 5,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00195',
    //   clientName: 'Lucky Horse Chinese Restaurant',
    //   sheetName: '00195',
    //   deliveryAddress: '13737 72 Ave #125, Surrey, BC V3W 2P2',
    //   contactNumber: '16045912770',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00196',
    //   clientName: 'Main Choice Chinese Restaurant',
    //   sheetName: '00196',
    //   deliveryAddress: '13393 72 Ave, Surrey, BC V3W 2N5',
    //   contactNumber: '16045918677',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00197',
    //   clientName: 'Kyoto Sushi',
    //   sheetName: '00197',
    //   deliveryAddress: '13651 72 Ave, Surrey, BC V3W 2P2',
    //   contactNumber: '16045922883',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00198',
    //   clientName: 'Sushi Topia',
    //   sheetName: '00198',
    //   deliveryAddress: '6350 120 St #120, Surrey, BC V3X 3K1',
    //   contactNumber: '16045922490',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00199',
    //   clientName: 'Sushi Wara',
    //   sheetName: '00199',
    //   deliveryAddress: '6485 120 St, Delta, BC V4E 3G3',
    //   contactNumber: '16045964460',
    //   categoryId: 4,
    //   password,
    //   role: 'client'
    // },
    // {
    //   clientId: '00200',
    //   clientName: "Calvin's Farm Market",
    //   sheetName: '00200',
    //   deliveryAddress: '6477 120 St, Delta, BC V4E 3G3',
    //   contactNumber: '16045071368',
    //   categoryId: 1,
    //   password,
    //   role: 'client'
    // },
    {
      clientId: '',
      clientName: "",
      sheetName: '',
      deliveryAddress: '',
      contactNumber: '',
      categoryId: 1,
      password,
      role: 'client'
    },
  ]

  // await prisma.category.createMany({
  //   data: [
  //     {
  //       name: 'Wholesale',
  //     },
  //     {
  //       name: 'Wholesale - partner 1',
  //     },
  //     {
  //       name: 'Wholesale - partner 2',
  //     },
  //     {
  //       name: 'Retail/Restaurant',
  //     },
  //     {
  //       name: 'Special price',
  //     },
  //   ],
  // });

  await prisma.user.createMany({
    data: [
      ...users,
      // {
      //   clientId: '1',
      //   clientName: 'Admin 1',
      //   sheetName: 'Admin 1',
      //   deliveryAddress: '1-6420 Beresford Street, Burnaby, BC, V5E 1B3',
      //   contactNumber: '7787891060',
      //   categoryId: 1,
      //   password,
      //   role: 'admin',
      // },
    ],
  });

  // await prisma.item.createMany({
  //   data: [
  //     {
  //       name: 'BEANSPROUTS 10 LBS',
  //       categoryId: 1,
  //       price: 8.5,
  //     },
  //     {
  //       name: 'BEANSPROUTS 10 LBS',
  //       categoryId: 2,
  //       price: 7.5,
  //     },
  //     {
  //       name: 'BEANSPROUTS 10 LBS',
  //       categoryId: 3,
  //       price: 8.5,
  //     },
  //     {
  //       name: 'BEANSPROUTS 10 LBS',
  //       categoryId: 4,
  //       price: 9.5,
  //     },
  //     {
  //       name: 'BEANSPROUTS 10 LBS',
  //       categoryId: 5,
  //       price: 9.5,
  //     },
  //     {
  //       name: 'BEANSPROUTS 5 LBS',
  //       categoryId: 1,
  //       price: 4.25,
  //     },
  //     {
  //       name: 'BEANSPROUTS 5 LBS',
  //       categoryId: 2,
  //       price: 3.75,
  //     },
  //     {
  //       name: 'BEANSPROUTS 5 LBS',
  //       categoryId: 3,
  //       price: 4.25,
  //     },
  //     {
  //       name: 'BEANSPROUTS 5 LBS',
  //       categoryId: 4,
  //       price: 4.75,
  //     },
  //     {
  //       name: 'BEANSPROUTS 5 LBS',
  //       categoryId: 5,
  //       price: 4.75,
  //     },
  //     {
  //       name: 'BEANSPROUTS 24 x 1 LB',
  //       categoryId: 1,
  //       price: 26,
  //     },
  //     {
  //       name: 'BEANSPROUTS 5 x 1 LB',
  //       categoryId: 1,
  //       price: 6.25,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 10 LBS',
  //       categoryId: 1,
  //       price: 8.5,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 10 LBS',
  //       categoryId: 2,
  //       price: 7.5,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 10 LBS',
  //       categoryId: 3,
  //       price: 8.5,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 10 LBS',
  //       categoryId: 4,
  //       price: 9.5,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 5 LBS',
  //       categoryId: 1,
  //       price: 4.25,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 5 LBS',
  //       categoryId: 2,
  //       price: 3.75,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 5 LBS',
  //       categoryId: 3,
  //       price: 4.25,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 5 LBS',
  //       categoryId: 4,
  //       price: 4.75,
  //     },
  //     {
  //       name: 'SOYA SPROUTS 24 x 1 LB',
  //       categoryId: 1,
  //       price: 26,
  //     },
  //     {
  //       name: 'BASIL',
  //       categoryId: 4,
  //       price: 7.75,
  //     },
  //     {
  //       name: 'BASIL',
  //       categoryId: 5,
  //       price: 7.75,
  //     },
  //     // {
  //     //   name: 'JUMBO EGGS',
  //     //   categoryId: 1,
  //     //   price: 0,
  //     // },
  //     // {
  //     //   name: 'JUMBO EGGS',
  //     //   categoryId: 2,
  //     //   price: 48,
  //     // },
  //     // {
  //     //   name: 'JUMBO EGGS',
  //     //   categoryId: 3,
  //     //   price: 0,
  //     // },
  //     {
  //       name: 'CUCCUMBER',
  //       categoryId: 2,
  //       price: 1,
  //     },
  //     {
  //       name: 'CUCCUMBER',
  //       categoryId: 4,
  //       price: 1.25,
  //     },
  //     {
  //       name: 'CUCCUMBER',
  //       categoryId: 5,
  //       price: 1,
  //     },
  //     {
  //       name: 'LIMES',
  //       categoryId: 2,
  //       price: 30,
  //     },
  //     {
  //       name: 'LIMES',
  //       categoryId: 4,
  //       price: 40,
  //     },
  //     {
  //       name: 'LIMES',
  //       categoryId: 2,
  //       price: 35,
  //     },
  //   ]});

  // await prisma.form.createMany({
  //   data: [
  //     {
  //       formName: 'Order Form',
  //       categoryId: 1,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 2,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 3,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 4,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 5,
  //     },
  //   ],
  // });

  // await prisma.input.createMany({
  //   data: [
  //     // Form 1
  //     {
  //       formId: 1,
  //       inputName: 'DELIVERY DATE',
  //       inputType: 'date',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'BEANSPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'BEANSPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'BEANSPROUTS 24 x 1 LB',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'BEANSPROUTS 5 x 1 LB',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'SOYA SPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'SOYA SPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'SOYA SPROUTS 24 x 1 LB',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 1,
  //       inputName: 'NOTE',
  //       inputType: 'text',
  //     },
  //     //  Form 2
  //     {
  //       formId: 2,
  //       inputName: 'DELIVERY DATE',
  //       inputType: 'date',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'BEANSPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'BEANSPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'SOYA SPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'SOYA SPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'CUCCUMBER',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'LIMES',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 2,
  //       inputName: 'NOTE',
  //       inputType: 'text',
  //     },
  //     // Form 3
  //     {
  //       formId: 3,
  //       inputName: 'DELIVERY DATE',
  //       inputType: 'date',
  //     },
  //     {
  //       formId: 3,
  //       inputName: 'BEANSPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 3,
  //       inputName: 'BEANSPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 3,
  //       inputName: 'SOYA SPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 3,
  //       inputName: 'SOYA SPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 3,
  //       inputName: 'NOTE',
  //       inputType: 'text',
  //     },
  //     // Form 4
  //     {
  //       formId: 4,
  //       inputName: 'DELIVERY DATE',
  //       inputType: 'date',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'BEANSPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'BEANSPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'SOYA SPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'SOYA SPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'BASIL',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'CUCCUMBER',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'LIMES',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 4,
  //       inputName: 'NOTE',
  //       inputType: 'text',
  //     },
  //     // Form 5
  //     {
  //       formId: 5,
  //       inputName: 'DELIVERY DATE',
  //       inputType: 'date',
  //     },
  //     {
  //       formId: 5,
  //       inputName: 'BEANSPROUTS 10 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 5,
  //       inputName: 'BEANSPROUTS 5 LBS',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 5,
  //       inputName: 'BASIL',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 5,
  //       inputName: 'CUCCUMBER',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 5,
  //       inputName: 'LIMES',
  //       inputType: 'number',
  //     },
  //     {
  //       formId: 5,
  //       inputName: 'NOTE',
  //       inputType: 'text',
  //     },
  //   ],
  // });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
