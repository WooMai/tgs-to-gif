import fs from 'fs';
import path from 'path';
import { ArgumentParser } from 'argparse';
import { toGifFromFile } from './index.js';
import { createBrowsers } from './utils.js';

const convertFiles = async function (filePaths, options) {
  for (const filePath of filePaths) {
    console.log(`Converting ${filePath}...`);

    try {
      await toGifFromFile(filePath, `${filePath}.gif`, options);
    } catch (e) {
      console.error(e);
    }
  }
};

const main = async function () {
  const parser = new ArgumentParser({
    description: 'Animated stickers for Telegram (*.tgs) to animated GIFs converter',
  });
  parser.add_argument('--height', {help: 'Output image height. Default: auto', type: Number});
  parser.add_argument('--width', {help: 'Output image width. Default: auto', type: Number});
  parser.add_argument('--fps', {help: 'Output frame rate. Default: auto', type: Number});
  parser.add_argument('--concurrency', {help: 'Output frame rate. Default: 1', type: Number, default: 1});
  parser.add_argument('paths', {help: 'Paths to .tgs files to convert', nargs: '+'});

  const args = parser.parse_args();

  const paths = args.paths;
  for (let i = 0; i < paths.length; ++i) {
    let filePath = paths[i];
    if (fs.lstatSync(filePath).isDirectory()) {
      for (const subFilePath of fs.readdirSync(filePath)) {
        if (path.extname(subFilePath) === '.tgs') {
          paths.push(path.join(filePath, subFilePath));
        }
      }
      paths.splice(i--, 1);
    }
  }

  const browsers = await createBrowsers(args.concurrency);
  await convertFiles(paths, { browsers, width: args.width, height: args.height, fps: args.fps });
  await Promise.all(browsers.map(browser => browser.close()));
};

main();
