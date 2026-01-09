export const getValueByPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc: any, key: string) => {
        return acc?.[key];
    }, obj);
}