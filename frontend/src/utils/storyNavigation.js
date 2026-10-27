// Reuse a complete archive already loaded by the homepage, without fetching it.
export const getStoryNavigation = (stories, storyId, language) => {
  const localizedStories = stories
    .filter(
      (story) =>
        !story.sections?.some(
          (section) => section.name?.toLowerCase() === "classifieds"
        )
    )
    .map((story) => ({
      story,
      translation: story.translations?.find(
        (translation) => translation.language === language
      ),
    }))
    .filter(({ translation }) => translation?.title?.trim())
    .sort(
      (a, b) =>
        new Date(b.story.created_at || 0) - new Date(a.story.created_at || 0) ||
        b.story.id - a.story.id
    );

  const currentIndex = localizedStories.findIndex(
    ({ story }) => story.id === storyId
  );
  const preview = (entry) => entry ? {
    id: entry.story.id,
    slug: entry.story.slug,
    image_url: entry.story.image_url,
    meta_description: entry.translation.meta_description,
  } : null;

  return {
    language,
    previous: currentIndex < 0 ? null : preview(localizedStories[currentIndex + 1]),
    next: currentIndex < 0 ? null : preview(localizedStories[currentIndex - 1]),
  };
};
