import { promises as fs } from "fs";
import ejs from "ejs";

/**
 * Prepares the source code for a html page
 * @param {string} path: file path
 * @param {object} params: Server side rendering (SSR) parameters
 */
const render = async (path, params) => {
  return new Promise(async (resolve, reject) => {
    try {
      let page = await fs.readFile(path, "utf8");
      // const result = eval("`" + page + "`");
      const result = ejs.render(page, params);
      return resolve(result);
    } catch (error) {
      return reject(error);
    }
  });
};

export default render;
