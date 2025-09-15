# Felix

**The Ghost theme for [Felix](https://felixonline.co.uk), the student newspaper of Imperial College London since 1949.**

---

![Felix website on 2024-11-02](https://github.com/user-attachments/assets/431a6bcc-f45e-470a-9ee1-6f46abd8641c)

---

This is a fork of the official Ghost theme [Source](https://github.com/TryGhost/Source),
styled in line with Felix brand guidelines.

## Development

### Project setup

Install [Node.js](https://nodejs.org), for example, using [`nvm`](https://github.com/nvm-sh/nvm), like so

```bash
# installs Node.js v22.14.0 at time of writing
nvm install --lts
```

To check that Node is installed correctly, try running `node --version`.
It should output the version number.

Next, enable the `yarn` package manager by running

```bash
# install yarn package manager
corepack enable
```

Check out the project code using `git` or an IDE.
Open a terminal in the theme root directory.
Run the command below to install project dependencies.

```bash
# install dependencies
yarn install
```

If you don't have Docker on your system, install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Start a local Ghost web server and database with the command below.

```bash
# starts Ghost CMS in a Docker container
docker compose up --pull always --force-recreate --remove-orphans
```

Use `CTRL+C` to stop the Ghost server once you are done.

The first run can take a while to initialise.
Once Ghost is ready, the site should be ready at [`http://localhost:2368`](http://localhost:2368).

If you encounter permission issues with the `.git` folder, you may need to reset its permissions with

```bash
chmod -R 777 .git
```

### Site setup

Go to the Ghost admin panel [`http://localhost:2368/ghost/`](http://localhost:2368/ghost/)
and create your local administrator account.

### Testing locally

The build process uses [Gulp](https://gulpjs.com/) and [PostCSS](https://postcss.org/)
to compile the source styles into minified, optimised, and future-proof CSS.

When working locally, the development server can handle theme compilation automatically.
As soon as it detects changes, it recompiles the necessary theme files.
To start the development server, run the command below.

```bash
# run development server
yarn dev
```

### Deploying to production

From the root folder of the project, run the command below to package the theme for deployment.

```bash
# create .zip file
yarn zip
```

The compiler saves the zip archive into `dist/felix.zip`.
You can upload this zip file to the [official Felix website](https://felixonline.co.uk).

## Theme project layout

Ghost uses a simple templating language called [Handlebars](http://handlebarsjs.com/) for its themes.
Take a look at the Ghost [theme API documentation](https://ghost.org/docs/themes/),
which explains every possible Handlebars helper and template.

**The main files are:**

- `default.hbs` - The parent template file, which includes the global header/footer
- `home.hbs` - The homepage
- `index.hbs` - The main template to generate a list of posts
- `post.hbs` - The template used to render individual posts
- `page.hbs` - Used for individual pages
- `tag.hbs` - Used for tag archives, e.g. “all posts tagged with `news`”
- `author.hbs` - Used for author archives, e.g. “all posts written by Jamie”

Adding the _slug_ of a page to a template file creates a custom one-off template. For example:

- `page-about.hbs` - Custom template for an `/about/` page
- `tag-news.hbs` - Custom template for `/tag/news/` archive
- `author-ali.hbs` - Custom template for `/author/ali/` archive

## Code standards

### CSS auto-prefixing

Do not worry about writing browser prefixes of any kind,
it is all done automatically with support for the latest two major versions of every browser.

### SVG Icons

This theme uses inline SVG icons, included via Handlebars partials.
You can find all icons inside `/partials/icons`.
To use an icon, include the name of the relevant file.
For example, to include the SVG icon in `/partials/icons/rss.hbs` use `{{> "icons/rss"}}`.

You can add your own SVG icons in the same manner.

## Copyright & Licence

Released under the [MIT licence](LICENSE).

* Copyright © 2013–2023 Ghost Foundation
* Copyright © 2024–2025 Felix
