export const checkIsKorean = (text: string) => {
    // const koreanRange = /^[\uAC00-\uD7AF]+$/;
    const koreanRange = /[\uAC00-\uD7AF]/;
    return koreanRange.test(text);
};