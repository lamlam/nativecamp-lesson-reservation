import fs from 'fs';

const FILENAME = 'SHOULD_NOTIFY';

try {
  fs.statSync(FILENAME);
  console.log('Should notify');
  process.env.SHOULD_NOTIFY = 'true';
} catch (_) {
  console.log('Should not notify');
}
