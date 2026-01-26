<template>
  <div id="app">
    <!-- 导航菜单 -->
    <nav class="nav">
      <div class="nav-container">
        <router-link to="/" class="nav-link" active-class="active">周报生成器</router-link>
        <router-link to="/todo" class="nav-link" active-class="active">待办事项</router-link>
        <router-link to="/calculator" class="nav-link" active-class="active">计算器</router-link>
      </div>
    </nav>
    
    <!-- 页面内容 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  padding: 0;
  min-height: 100vh;
  font-size: 16px;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 导航样式 */
.nav {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 18px 0;
  display: block;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #e8f5e8;
}

.nav-link.active {
  color: #c8e6c9;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #c8e6c9;
  border-radius: 3px 3px 0 0;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}
</style>
