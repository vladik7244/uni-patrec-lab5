const fetch = require('node-fetch');
const HOST = 'localhost';
const PORT = 9000;
const ROOT_API = `http://${HOST}:${PORT}`;

const fs = require("fs");

const config = {
  itemsPath: "./digits"
};

class App {
  static getListOfItems() {
    let files = [];
    try {
      files = fs.readdirSync(config.itemsPath);
    } catch (e) {
      throw e;
    }

    return files;
  }

  static getItems() {
    const files = App.getListOfItems();
    const items = [];

    files.forEach(function (fileName) {
      items.push({
        value: fs.readFileSync(config.itemsPath + "/" + fileName, 'utf8'),
        mark: fileName
      });
    });
    return items;
  }

  static parseItems(items, marks = []) {
    //return items.map((item, i) => new lib.Item(item.split(""), marks[i]));
  }

  static itemsAdapter(items) {

  }
}



const clasterize = (items, limit) => {
  return new Promise((resolve, reject) => {
    fetch(`${ROOT_API}/clasterize`, {
      method: "POST",
      body: JSON.stringify({
        items: items,
        // marks: originItems.map(item => item.mark),
        limit: limit
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        resolve(data)
      })
      .catch(err=>console.error(err));
  });
};

let originItems = [
  {mark: "1", value: "1010111111"},
  {mark: "1", value: "1011111111"},
  {mark: "1", value: "1010111111"},
  {mark: "1", value: "1111111111"},
  {mark: "1", value: "1111111111"},
  {mark: "1", value: "1111111111"},
  {mark: "1", value: "1011111111"},
  {mark: "1", value: "1111111111"},
  {mark: "1", value: "1111111111"},
  {mark: "0", value: "0000000000"},
  {mark: "0", value: "0001000000"},
  {mark: "0", value: "0100000000"},
  {mark: "0", value: "0000000000"},
  {mark: "0", value: "0000000000"},
  {mark: "0", value: "0100000000"},
  {mark: "0", value: "0001000000"},
  {mark: "0", value: "0000000000"},
];

//originItems = App.getItems();

const minAttrCount = 5;
const clasterCount = 2;

const reduceAttrs = (items, redundantAttrs) => {
  return items.map(item => item.value.split("").filter((_, i)=>redundantAttrs.indexOf(i) === -1).join(""));
};

let redundantAttrs = [];

const findRedundantAttr = (items, redundantAttrs) => {
  return new Promise((resolve, reject) => {
    const attrsCount = items[0].value.length;

    let minSumDistance = Infinity;
    let minSDAttrIndex = -1;

    rec(0);

    function rec(attrIndex) {
      clasterize(reduceAttrs(originItems, redundantAttrs.concat([attrIndex])), clasterCount)
        .then(data => {
          //console.log(attrIndex, data.sumDistance);
          if (data.sumDistance < minSumDistance) {
            minSumDistance = data.sumDistance;
            minSDAttrIndex = attrIndex;
          }
          if (attrIndex < attrsCount) {
            rec(attrIndex + 1);
          } else {
            resolve( redundantAttrs.concat([minSDAttrIndex]));
          }

          //console.log(JSON.stringify(data, null, 2));
        });
    }
  })
};

const findAll = (originItems, redundantAttrs) => {
  findRedundantAttr(originItems, redundantAttrs)
    .then(redundantAttrs => {
      console.log(redundantAttrs);
      if (redundantAttrs.length < 5) {
        findAll(originItems, redundantAttrs);
      }
    });
};


findAll(originItems, redundantAttrs);

