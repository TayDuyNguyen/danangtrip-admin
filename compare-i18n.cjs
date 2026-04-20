const fs = require('fs');
const path = require('path');

const viDir = path.join(__dirname, '../../../../DATN/danangtrip-admin/public/lang/vi');
const enDir = path.join(__dirname, '../../../../DATN/danangtrip-admin/public/lang/en');

function flattenObject(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function checkFiles(dir1, dir2, name1, name2) {
  const files = fs.readdirSync(dir1).filter(f => f.endsWith('.json'));
  const issues = {};

  for (const file of files) {
    const p1 = path.join(dir1, file);
    const p2 = path.join(dir2, file);
    
    if (!fs.existsSync(p2)) {
      issues[file] = `Missing in ${name2}`;
      continue;
    }

    try {
        const obj1 = flattenObject(JSON.parse(fs.readFileSync(p1, 'utf8') || "{}"));
        const obj2 = flattenObject(JSON.parse(fs.readFileSync(p2, 'utf8') || "{}"));

        const missingIn2 = Object.keys(obj1).filter(k => !(k in obj2));
        const missingIn1 = Object.keys(obj2).filter(k => !(k in obj1));

        if (missingIn1.length > 0 || missingIn2.length > 0) {
        issues[file] = {
            [`Missing in ${name2}`]: missingIn2,
            [`Missing in ${name1}`]: missingIn1
        };
        }
    } catch(e) {
        console.error("Error reading", p1, p2, e);
    }
  }
  return issues;
}

console.log(JSON.stringify(checkFiles(viDir, enDir, 'vi', 'en'), null, 2));
