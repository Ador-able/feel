<template>
    <div class="home">
        <header class="hero">
            <h1>绘画训练助手</h1>
            <p>通过科学的练习提升您的绘画技能</p>
        </header>

        <div class="training-grid">
            <div class="training-card" @click="navigateTo('/length-training')">
                <div class="card-icon">📏</div>
                <h3>长度目测训练</h3>
                <p>提升对线段长度的感知能力，让您的比例更加准确</p>
            </div>

            <div class="training-card" @click="navigateTo('/angle-training')">
                <div class="card-icon">📐</div>
                <h3>角度目测训练</h3>
                <p>训练角度感知，让您的透视和结构更加精准</p>
            </div>

            <div class="training-card" @click="navigateTo('/proportion-training')">
                <div class="card-icon">⚖️</div>
                <h3>比例训练</h3>
                <p>练习不同形状之间的比例关系，提升构图能力</p>
            </div>

            <div class="training-card" @click="navigateTo('/progress')">
                <div class="card-icon">📊</div>
                <h3>进度统计</h3>
                <p>查看您的练习记录和进步曲线</p>
            </div>
        </div>

        <section class="features">
            <h2>为什么需要目测训练？</h2>
            <div class="feature-list">
                <div class="feature-item">
                    <h4>🎯 提升观察力</h4>
                    <p>通过反复练习培养敏锐的视觉感知能力</p>
                </div>
                <div class="feature-item">
                    <h4>📈 建立准确性</h4>
                    <p>逐步提高对长度、角度、比例的判断准确性</p>
                </div>
                <div class="feature-item">
                    <h4>🧠 肌肉记忆</h4>
                    <p>将准确的视觉判断转化为自然的绘画习惯</p>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
    router.push(path)
}
</script>

<style scoped>
.home {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.hero {
    text-align: center;
    margin-bottom: 4rem;
}

.hero h1 {
    font-size: 3rem;
    color: #2c3e50;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    color: #7f8c8d;
}

.training-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
}

.training-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    padding: 2rem;
    text-align: center;
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.training-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.training-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.training-card p {
    opacity: 0.9;
    line-height: 1.6;
}

.features {
    margin-top: 4rem;
}

.features h2 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
    font-size: 2rem;
}

.feature-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature-item {
    text-align: center;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 10px;
}

.feature-item h4 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.feature-item p {
    color: #7f8c8d;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .hero h1 {
        font-size: 2rem;
    }

    .training-grid {
        grid-template-columns: 1fr;
    }
}
</style>
