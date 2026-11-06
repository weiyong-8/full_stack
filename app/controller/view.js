module.exports = (app) => {
  return class viewController {
    /**
     * 渲染页面
     * @param {object} ctx 上下文
     */
    async renderPage(ctx) {
      await ctx.render(`output/entry.${ctx.params.page}`, {
        name: app.options?.name,
        env: app.env.get(),
        options: JSON.stringify(app.options),
      });
    }
  };
};
