module.exports = (app) => {
  const BaseController = require('./base')(app);
  return class projectController extends BaseController {
    /**
     * 获取项目列表
     * @param {object} ctx 上下文
     */
    async getList(ctx) {
      const { proj_key: projKey } = ctx.request.query;
      console.log(projKey, 'projKey1111111');
      const { project: projectService } = app.service;
      const projectList = await projectService.getList();
      this.success(ctx, projectList);
    }
  };
};
