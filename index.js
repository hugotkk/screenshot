#!/usr/bin/env node

const fs = require('fs');
const puppeteer = require('puppeteer');
const slug = require('slug');
const path = require('path');
const yargs = require('yargs/yargs')
const async = require("async");
const { hideBin } = require('yargs/helpers')

yargs(hideBin(process.argv))
    .option('l', {
        alias: 'limit',
        default: 5,
        describe: 'Limited concurrent screenshot',
        demandOption: false,
        type: 'number'
    })
    .command('$0 <dest> [urls..]',
        'Take screenshot on multiple urls',
        () => {
        },
        async (argv) => {
            const limit = argv.limit;
            basePath = argv.dest
            urls = argv.urls;
            if(!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath);
            }
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            async function takeScreenShot(url, callback) {
                console.log(`Working on ${url}`);
                var output = slug(url) + '.png';
                const page = await browser.newPage();
                await page.goto(url);
                await page.screenshot({
                    path: path.join(basePath, output)
                });
                await page.close();
                console.log(`Finish on ${url}`);
                callback();
            }
            var q = async.queue(function (task, callback) {
                takeScreenShot(task.url, callback);
            }, limit);
            for (var i = 0, len = urls.length; i < len; i++) {
                q.push({
                    url: urls[i]
                });
            }
            await q.drain();
            console.log('Done!');
            await browser.close();
        }
    )
    .help()
    .argv;
