const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
      // 开发代理目标：默认本地后端，可用环境变量 VUE_APP_PROXY_TARGET 覆盖
      // 例：VUE_APP_PROXY_TARGET=http://你的服务器IP:8080 npm run serve
      target: process.env.VUE_APP_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
