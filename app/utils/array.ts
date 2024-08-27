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

  if (result.length === 0) {
    return [newElement];
  }

  for (let i = 0; i < result.length; i++) {
    if (!result[i + 1]) {
      break;
    }

    if (result[i].id < newElement.id && result[i + 1].id > newElement.id) {
      result.splice(i + 1, 0, newElement);
      return result;
    }
  }

  result.push(newElement);
  return result;
};

// export const customSortItemKeys = (keys: string[]): any => {
//   const mainKeys = mainItems.map((key) => keys.includes(key)).filter;
//   // const sortedMainKeys = mainItems.map((key) => mainKeys.includes(key));

//   const otherKeys = keys.filter((key) => !mainItems.includes(key));
//   return [...sortedMainKeys, ...otherKeys];
// };

export const sortedItemKeys = (listToSort: string[], basedSortArray: string[]) => {
  return listToSort.sort((a, b) => {
    // Get the index of the current elements in the basedSortArray
    const indexA = basedSortArray.indexOf(a);
    const indexB = basedSortArray.indexOf(b);

    // If both elements are in the basedSortArray, compare their indices
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one element is in the basedSortArray, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither element is in the basedSortArray, sort them alphabetically
    return a.localeCompare(b);
  })};

