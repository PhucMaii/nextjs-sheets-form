import Fuse from 'fuse.js';

export const handleSearch = (
  searchKeywords: string,
  baseList: any,
  searchFields: string[],
) => {
  if (searchKeywords.length === 0) {
    return baseList;
    return;
  }

  const fuse = new Fuse(baseList, {
    keys: searchFields,
  });

  const result = fuse.search(searchKeywords);
  const data = result.map((item: any) => item.item);
  return data;
};
