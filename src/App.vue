<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <RouterLink to="/" class="brand-link">
            🎨 绘画训练助手
          </RouterLink>
        </div>
        <ul class="nav-menu">
          <li>
            <RouterLink to="/" class="nav-link">首页</RouterLink>
          </li>
          <li>
            <RouterLink to="/length-training" class="nav-link">长度训练</RouterLink>
          </li>
          <li>
            <RouterLink to="/angle-training" class="nav-link">角度训练</RouterLink>
          </li>
          <li>
            <RouterLink to="/proportion-training" class="nav-link">比例训练</RouterLink>
          </li>
          <li>
            <RouterLink to="/progress" class="nav-link">进度统计</RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="main-footer">
      <p>&copy; 2024 绘画训练助手 - 提升您的艺术技能</p>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  text-decoration: none;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #007bff;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #007bff;
}

.nav-link.router-link-active {
  background: #007bff;
  color: white;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.main-footer {
  background: rgba(44, 62, 80, 0.9);
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: auto;
}

.main-footer p {
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 1rem 2rem;
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
