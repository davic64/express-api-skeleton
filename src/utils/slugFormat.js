const slugFormat = (name) => {
  let slug = name.toLowerCase();
  slug = slug.replace(/[^\w\s]/g, "");
  slug = slug.replace(/\s+/g, "-");
  return slug;
};

export default slugFormat;
