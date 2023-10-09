// Web dev is weird and so is this file. Compiling things like SCSS, Pug.js,
// and TypeScript is very formulaic so to avoid that and reduce magics, the
// file is broken into two sections. Every compilation thing that needs to be
// done is given a metacompiler with the naming convention <thing>_compiler.
// That function takes in the path of the file to be compiled, the output
// and the name of the task that will do that compiling. It returns an
// anonymous function that does that compiling. There are then exports that
// run tons of these constructed anonymous functions in parallel.

// All of the sites are based off of the same template and structure. Because of
// this, I am able to just have a list of sites in sites.json, and then go
// through the steps of compiling everything in that file. 

import gulp from 'gulp';
const { src, dest, parallel, series } = gulp;
import { existsSync, readFileSync } from 'fs';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import * as sass_import from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(sass_import);
import autoprefixer from 'gulp-autoprefixer';
import pug from 'gulp-pug';
import ts from 'gulp-typescript';
import webpack from 'webpack-stream';
import { deleteAsync } from 'del';
import readline from 'readline/promises';
const user_input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pages = JSON.parse(readFileSync('sites.json', 'utf8'));

// -------- Compilers

// Returns a function that compiles the scss file(s) in input to css in output
function scss_compiler(input, output, task_name) {
    const fn = () => src(input)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(dest(output));

    fn.displayName = task_name;
    return fn;
}

// Returns a function that compiles the pug file(s) in input to html in output
function pug_compiler(input, output, task_name) {
    const fn = () => src(input)
        .pipe(pug({
            locals: {
                pages: pages
            }
        }))
        .pipe(dest(output));

    fn.displayName = task_name;
    return fn;
}

// Returns a function that compiles the ts file(s) in input to html in output
function ts_compiler(input, output, task_name) {
    const fn = () => src(input)
        .pipe(ts({
            noImplicitAny: true,
            // Usually I would set the rootDir to the directory that you are
            // compiling the ts in, but because we're compiling multiple dirs
            // with the same script it yells at you so you have to do all of src
            rootDir: './src'
        }))
        .pipe(dest(output));

    fn.displayName = task_name;
    return fn;
}

// -------- Club Utils

function compile_page(name) {
    var fn = parallel(
        scss_compiler(`./src/${name}/scss/style.scss`, `./dist/${name}/css`, `compile_scss_${name}`),
        pug_compiler(`./src/${name}/pug/index.pug`, `./dist/${name}/`, `compile_pug_${name}`),
        ts_compiler(`./src/${name}/typescript/*`, `./dist/${name}/ts/`, `compile_ts_${name}`),
    );

    fn.displayName = `compile_${name}`;
    return fn;
}

function build_page(name) {
    var fn = series(
        compile_page(name),
        pack_js(`./dist/${name}/ts/script.js`, `./dist/${name}/js/`, `pack_ts_${name}`),
        clean_folder(`./dist/${name}/ts`, `clean_ts_${name}`)
    );

    fn.displayName = `compile_${name}`;
    return fn;
}

// -------- Miscellaneous

// Returns a function that packs a js file in input to output
function pack_js(input, output, task_name) {
    const fn = () => src(input)
        .pipe(webpack({
            mode: 'production'
        }))
        .pipe(dest(output))

    fn.displayName = task_name;
    return fn;
}

// Move a file(s) unchanged
function pass_file(input, output, task_name) {
    const fn = () => src(input)
        .pipe(dest(output))

    fn.displayName = task_name;
    return fn;
}

// Delete a folder
function clean_folder(folder, task_name) {
    const fn = () => deleteAsync(folder);

    fn.displayName = task_name;
    return fn;
}

// -------- Exports

//Compile kit
const compile_scss_kit = () =>
    existsSync('./dist/kit.css') ? Promise.resolve()
        : scss_compiler('./src/kit.scss', './dist', '')();
const compile_ts_kit = () =>
    existsSync('./dist/kit.js') ? Promise.resolve()
        : ts_compiler('./src/kit.ts', './dist', '')();
export const compile_kit = parallel(
    compile_scss_kit,
    compile_ts_kit
);

// Pass
export const pass = parallel(
    pass_file('./src/SpartanFullLogo.png', './dist/', 'pass_lhs_logo_home')
);

const build_scripts = pages.map(p => build_page(p.name));
export const build_site = series(
    compile_kit,
    parallel(build_scripts),
    pass
);

async function copy_over_index(input, output, title, name) {
    const file_content = await readFile(input, 'utf8');
    const title_replace = file_content.replaceAll('${title}', title);
    const name_replace = title_replace.replaceAll('${name}', name);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, name_replace);
}
export async function new_page() {
    const name = await user_input.question('Name for new page: ');
    const displayName = await user_input.question('Name to be displayed in sidebar: ');
    user_input.close();
    const new_page_info = {
        name: name,
        displayName: displayName,
        path: `../${name}/index.html`
    };
    const new_pages = pages.concat([new_page_info]);
    await writeFile('sites.json', JSON.stringify(new_pages));
    await copy_over_index('./src/uni/template/pug/index.pug', `./src/${name}/pug/index.pug`, displayName, name);
    return src(['./src/uni/template/**/*', '!./src/uni/template/pug/index.pug'], { base: "./src/uni/template" }).pipe(dest(`./src/${name}`));
}
