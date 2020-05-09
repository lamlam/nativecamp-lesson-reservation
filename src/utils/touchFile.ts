import fs from 'fs';

export function touchFile(filename = 'tmp'): void {
  const time = new Date();

  try {
    fs.utimesSync(filename, time, time);
  } catch (err) {
    fs.closeSync(fs.openSync(filename, 'w'));
  }
}
