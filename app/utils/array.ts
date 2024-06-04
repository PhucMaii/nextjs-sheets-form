// Utility function to group items by a key
export const groupBy = (array: any[], key: (item: any) => any) => {
  return array.reduce((result, item) => {
    const groupKey = key(item);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};


export const insertInSortedIdArray = (array: any[], newElement: any) => {
  const result = [...array];
  for (let i = 0; i < result.length; i++) {
    if (result[i].id < newElement.id && result[i + 1].id > newElement.id) {
      result.splice(i + 1, 0, newElement);
      break;
    }
  }

  return result;
}