const glob = require('glob');
const path = require('path');
const { sep } = path; // 兼容不同操作系统上的斜杠

/**
 * controller loader
 * @param {object} app Koa 实例
 *
 * 加载所有 controller，可通过 'app.controller.${目录}.${文件}' 访问
 *
   例子：
   app/controller
     |
     | -- custom-module
              |
              |  -- custom-controller.js

   => app.controller.customModule.customController
 *
 */
module.exports = (app) => {
  // 读取 app/controller/**/**.js 下所有文件
  const controllerPath = path.resolve(app.businessPath, `.${sep}controller`);
  const fileList = glob.sync(
    path.resolve(controllerPath, `.${sep}**${sep}**.js`),
  );

  //遍历所有文件目录，把内容加载到 app.controller 下
  const controller = {};
  fileList.forEach((file) => {
    //提取文件名称
    let name = path.relative(file);

    // 截取路径 app/controller/custom-module/custom-controller.js => custom-module/custom-controller
    name = name.substring(
      name.lastIndexOf(`controller${sep}`) + `controller${sep}`.length,
      name.lastIndexOf('.'),
    );

    //把 '-' 统一改为驼峰式，custom-module/custom-controller.js => customModule.customController
    name = name.replace(/[_-][a-z]/gi, (s) => s.substring(1).toUpperCase());

    // 挂载 controller 到内存 app 对象中
    let tempController = controller;
    const names = name.split(sep); // [ customModule(目录), customController(文件) ]
    for (let i = 0, len = names.length; i < len; ++i) {
      if (i === len - 1) {
        const ControllerMoule = require(path.resolve(file))(app);
        // 文件
        tempController[names[i]] = new ControllerMoule();
      } else {
        // 文件夹
        if (!tempController[names[i]]) {
          tempController[names[i]] = {};
        }
        tempController = tempController[names[i]];
      }
    }
  });

  app.controller = controller;
};
