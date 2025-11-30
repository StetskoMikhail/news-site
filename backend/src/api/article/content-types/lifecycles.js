const slugify = require("slugify");

module.exports = {
  beforeCreate(event) {
    console.log("=== LIFECYCLE HOOK TRIGGERED ===");
    const { data } = event.params;
    console.log("Original data:", data);

    if (data && data.title && !data.slug) {
      try {
        const generatedSlug =
          slugify(data.title, {
            lower: true,
            strict: true,
          }) +
          "-" +
          Date.now();

        console.log("Generated slug:", generatedSlug);
        data.slug = generatedSlug;
        console.log("Updated data:", data);
      } catch (error) {
        console.error("Slugify error:", error);
      }
    } else {
      console.log(
        "Skipping slug generation - title missing or slug already exists",
      );
    }
  },
};
