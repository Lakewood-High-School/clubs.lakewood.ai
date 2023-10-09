# lakewood.ai
This is the frontend of the lakewood.ai website. This is not the actual hosting; that is managed by Apache2 configured on the server (containerization might come later but this works for now). This package just produces a bunch of files that are then served by Apache2.

## Overview
This project forgoes the plebian languages of usual web development. We are members of the bourgeoisie here. Therefore, this project uses Pug.js, SCSS, and TypeScript. It is all compiled together by Gulp. We also use yarn instead of npm, because its output looks nicer. This setup will allow efficient and runtime (type) error bug free (sort of) development. Really it all just looks nicer.

### Pug
HTML is complex and verbose. We replace it with Pug.js, which gives it an indentation based syntax instead of an XML based syntax. It looks much more clean this way. It also allows computed (and passed) attributes in the site, which will be very useful during compilation.

### SCSS
SCSS is an extension of regular CSS, that allows nesting, imports, variables, and a suite of other cool things. It, of course, gets compiled to CSS eventually. There is an alternate syntax, called SASS that looks closer to yaml and Pug.js, but it is up to Mr. Cortez whether we go with that instead. It appears that SCSS is the newer one.

### TypeScript
Just javascript with types, really. It also has a much nicer import syntax. Not that much more to be said about it.

### Gulp
Gulp is a task scripter, that allows us to write down the complex motions of compiling the website, and execute it with a few fingerstrokes in our terminal. It also allows Makefile type seperation of various tasks, so you don't have to recompile the whole website if you only change a single thing.

## File Structure
### Source
All of the source files that we write are stored in `./src/`. This is then divided into folders that each contain a site. Each site will contain a `pug/` folder, which contains the Pug.js code, an `scss/` folder, which contains the SCSS code, and a `typescript/` folder, which contains the TypeScript code. in `uni/` you will find things that all sites rely on, but are not actually outputted themselves into `dist/`. It's mainly templates.

### Build
The build is located in `dist/`. Currently, `dist/` is divided into folders that contain the sites, just like in `src/`. Each of these page folders contain an `html/` folder that contains the html (compiled from the Pug.js usually), and a `css/` folder that contains the CSS (compiled from the SCSS usually). The scripting is a bit weird. It has too be done in two passes, first the TypeScript compilation, then the webpack. We'll probably develop a better solution eventually, but right now I am outputting the compiled TypeScript to the folder `ts/` in the page. This is then packed to the folder `js/`. After it gets packed the whole folder is deleted to keep down the size of `dist/`. The base level of `dist/` also contains `kit.js` and `kit.css` which are the compiled files from the kit. Because of this, we don't need the actual kit files, meaning we just need `dist/` to completely run the site so it's all we would need in a container.

### Kit
Our modified version of the kit is located in `kit/`.

## Compilation
Run `yarn gulp build_site` to compile the site. It compiles every site listed in `sites.json`. It checks if it has already compiled `kit.js` and `kit.css` by seeing if they already exist and if they do it does not recompile them. This way, it compiles on first boot, but doesn't waste time recompiling something that never changes. If you really need to recompile them, then you can just delete `kit.js` and `kit.css` and it will think it's a first time compilation and redo them. Every site runs the compilation of the TS, SCSS, and Pug.js in parallel, then packs the TypeScript, then cleans. 

## Extending
You can add a new site by running `yarn gulp new_page`. It will prompt you for the internal name of the page, which is never shown to the user, but is how that page is refered to across the code. It will then prompt you for the actual display name of the page in the sidebar and the tab name. Once it has this information, it will add the new page to `sites.json` and create a new foler with some base code for the site in `src/`. You don't have to do anything else, just rebuild the site and it will be added to the sidebar and everything. The template that it draws from is located in `src/uni/template/`.

## The Kit
We're not UI designers. We're programmers; their antithesis. So we chose a theme for Bootstrap 5 from a group known as Creative Tim. This can be found [here](https://www.creative-tim.com/product/material-dashboard).
