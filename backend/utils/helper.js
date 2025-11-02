export const parseCategories = (categories) => {
  if (!categories) return categories;
  
  if (typeof categories === 'string') {
    try {
      return JSON.parse(categories);
    } catch (parseError) {
        // If it's not valid JSON, treat it as a single category
        console.log(parseError);
      return [categories];
    }
  }
  return categories;
};