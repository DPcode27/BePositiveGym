import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderPath = path.resolve(__dirname, '../public/temp');

const getFiles = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        return reject(`Error reading directory: ${err}`);
      }

      // Filter out directories and only get file names
      const fileNames = files
        .filter((file) => fs.statSync(path.join(folderPath, file)).isFile())
        .map((file) => file.slice(file.lastIndexOf('_') + 1, -5));
      
      resolve(fileNames);
    });
  });
};

export default getFiles;