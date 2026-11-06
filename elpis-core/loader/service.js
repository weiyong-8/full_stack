const glob = require('glob');
const path = require('path');
const { sep } = path; // 兼容不同操作系统上的斜杠

/**
 * service loader
 * @param {object} app Koa 实例
 *
 * 加载所有 service，可通过 'app.service.${目录}.${文件}' 访问
 *
   例子：
   app/service
     |
     | -- custom-module
              |
              |  -- custom-service.js

   => app.service.customModule.customService
 *
 */
module.exports = (app) => {
  // 读取 app/service/**/**.js 下所有文件
  const servicePath = path.resolve(app.businessPath, `.${sep}service`);
  const fileList = glob.sync(path.resolve(servicePath, `.${sep}**${sep}**.js`));

  //遍历所有文件目录，把内容加载到 app.service 下
  const service = {};
  fileList.forEach((file) => {
    //提取文件名称
    let name = path.resolve(file);

    // 截取路径 app/service/custom-module/custom-service.js => custom-module/custom-service
    name = name.substring(
      name.lastIndexOf(`service${sep}`) + `service${sep}`.length,
      name.lastIndexOf('.'),
    );

    //把 '-' 统一改为驼峰式，custom-module/custom-service.js => customModule.customService
    name = name.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());

    // 挂载 service 到内存 app 对象中
    let tempService = service;
    const names = name.split(sep); // [ customModule(目录), customService(文件) ]
    for (let i = 0, len = names.length; i < len; ++i) {
      if (i === len - 1) {
        const serviceMoule = require(path.resolve(file))(app);
        // 文件
        tempService[names[i]] = new serviceMoule();
      } else {
        // 文件夹
        if (!tempService[names[i]]) {
          tempService[names[i]] = {};
        }
        tempService = tempService[names[i]];
      }
    }
  });

  app.service = service;
};
