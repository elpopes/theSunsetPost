# The Sunset Post

The Sunset Post is a hyperlocal, trilingual news and information platform for Sunset Park, Brooklyn.

This repository contains the codebase for the Sunset Post website. The live publication serves Sunset Park residents, workers, families, small businesses, schools, community organizations, and neighbors in the languages many people use every day: English, Spanish, and Chinese.

The project is also intended to become a reusable model for other communities that want to build local, multilingual information platforms where they live.

## Mission

The Sunset Post exists to make local information easier to find, easier to understand, and easier to share across language communities.

Sunset Park is a multilingual neighborhood with deep local knowledge, active small businesses, strong civic life, and many residents who are not always served well by citywide media. The site is designed to publish practical, neighborhood-level information — news, events, classifieds, transit information, weather, local business updates, community resources, and feature stories — in a format that can move across English, Spanish, and Chinese.

The broader goal is not only to build one neighborhood news site, but to create a platform that other communities can adapt for their own local multilingual news needs.

## About this repository

This repository contains the technical codebase for the Sunset Post website.

We welcome volunteers, contributors, and community members who are interested in helping improve the project. Our goal is to build a strong, useful platform for Sunset Park while also making the software easier to share, adapt, and reuse for other multilingual local news and community information projects.

The codebase currently uses:

- Ruby on Rails API backend
- React frontend
- PostgreSQL
- Active Storage with AWS S3 support for production image storage
- JWT-based authentication
- Trilingual content structures
- Weather, transit, RSS, contact, classified, search, author, and story APIs
- Google Analytics support
- Newsletter signup and outreach/ad rotation

## Features

### Trilingual publishing

The site supports English, Spanish, and Chinese content. Story titles, story text, captions, metadata, interface labels, newsletter signup, and outreach/ad artwork can be localized.

**Next:** make supported languages configurable for other communities.

### Stories and editorial publishing

The stories system supports story listings, individual story pages, readable slugs, localized content, captions, meta descriptions, story dates, featured images, authors, sections, admin create/edit/delete tools, inline image upload, and preview routes.

**Next:** make all managed content editable through the admin interface. After that, add draft/publish states, scheduled publishing, tags, richer editorial roles, and stronger preview/review tools.

### Sections

Stories can be organized into sections so readers can view stories by category.

**Next:** improve section management, strengthen section landing pages, and make section navigation consistent across languages.

### Authors

Stories can be connected to authors. Author records can include a name, bio, image, and localized bio translations.

**Next:** create public writer pages that show each author’s bio and all of that writer’s stories in one place.

### Classifieds

The site includes classified listings, individual classified pages, classified categories, classified subcategories, and admin create/edit/delete tools.

**Next:** let community members submit classifieds through a public form, save submissions as pending, and allow admins to review, edit, approve, and publish them.

### Contact

The site includes a contact form for readers, community members, contributors, and potential advertisers.

**Next:** split contact flows into clearer paths for editorial tips, general questions, advertising/sales inquiries, classifieds, submissions, and technical support.

### Advertising, outreach, and support

The site has a rotating outreach/ad panel that supports multilingual artwork and links. Current uses include advertising outreach, support/subscription messaging, donation/support graphics, newsletter signup, local partner messages, house ads, and trilingual ad artwork.

**Next:** create a public advertising page with current ad rates, print and digital specs, artwork requirements, deadlines, contact information, and examples of available placements.

### Newsletter signup

The site includes newsletter signup embeds for English, Spanish, and Chinese. Newsletter signup appears in the outreach/ad rotation.

**Next:** improve mobile newsletter presentation, add users to the free newsletter flow when they create an account, add subscriber language preferences, and make opt-out and language switching clearer.

### Local information

The site includes local weather and MTA/transit API integration. Bus time component work is already started.

**Next:** use the bus time component on a dedicated bus times page, then connect saved transit stops to public reader accounts so users can store preferred bus or subway information.

### RSS feeds

The site includes RSS routes, including language-specific RSS feeds.

**Next:** fix RSS image URLs so feeds reliably include uploaded story images from Active Storage/AWS, validate the feeds, and add richer language-specific RSS metadata.

### Search

The backend includes a search endpoint for finding site content.

**Next:** improve frontend search with lazy loading or infinite scroll so results continue loading as the user scrolls. Later search work should support filtering by story, section, tag, author, and classifieds.

### Authentication and reader accounts

The site includes JWT-based authentication. Login is currently used primarily for admin functionality.

**Next:** expand login for public reader accounts, including saved stories, favorite stories, preferred language, newsletter preferences, and saved transit stops.

### Analytics and popular stories

The frontend includes Google Analytics support for pageviews and events. The outreach/ad system also includes view and click event tracking for house ads, support graphics, and newsletter placements.

**Next:** create a first-party `StoryView` model/table and related tracking so the site can collect qualified story views, support internal analytics, and power dynamic content such as a “Popular Now,” “Lo más leído,” or “大家在读” carousel.

### Images, media, and files

The site supports uploaded images through Rails Active Storage, with AWS S3 support for production image storage. Images are used for story featured images, inline editor images, author images, outreach graphics, and advertising artwork.

**Next:** improve media management, support additional file types, add clearer image and file requirements, improve RSS image handling, and create a reusable media workflow for editors.

### Reusable multilingual platform

The Sunset Post is built for Sunset Park, Brooklyn, but the underlying platform is meant to be adaptable.

**Next:** separate community-specific configuration from reusable platform code, including site name, neighborhood, language set, weather location, transit settings, outreach graphics, editorial categories, and publication branding. Longer term, build a launch flow that lets new users configure a local multilingual news site through setup screens and deploy their own version of the platform.

## Roadmap and issues

Enhancements, bugs, feature ideas, and longer-term platform goals are tracked through GitHub Issues. Check the Issues tab for active work, planned features, and places where contributors can help.

## Running the project locally

Detailed setup instructions belong in `docs/LOCAL_SETUP.md`. That guide should explain how to clone the repository, install backend and frontend dependencies, set up PostgreSQL, run Rails and React, create the first admin user, configure environment variables, and connect optional services such as AWS S3, the MTA API, Google Analytics, and email delivery.

A future `bin/setup` script should automate as much of the local setup process as possible.

## Contributing

This project welcomes help from developers, designers, translators, journalists, students, community members, and neighbors.

To get involved, read `docs/LOCAL_SETUP.md`, run the project locally, and review open GitHub Issues. Comment on an issue you want to help with, or open a new issue for a bug or feature idea. For code changes, create a feature branch and submit a pull request or share your branch for review.

## Sunset Post Community Software License

This project is shared for community learning, collaboration, and reuse.

You may read, study, modify, and adapt the code for noncommercial local news, community information, educational, or civic projects. You may also contribute improvements back to this repository.

You may not, without written permission, use the Sunset Post name, logo, branding, original editorial content, original artwork, or publication identity for another project. You may not resell the code or a substantially similar hosted platform as a commercial product, use the project to create misleading or impersonating publications, or remove attribution to the original Sunset Post project when adapting the code for public use.

If you adapt this project, credit the Sunset Post project in your repository or public documentation.
