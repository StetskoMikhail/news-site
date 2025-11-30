<template>
  <div class="login-container">
    <div class="background-gradient">
      <div class="center-wrapper">
        <div class="card-container">
          <div class="card-header">
            <h2 class="title">Добро пожаловать</h2>
            <p class="subtitle">Войдите в свой аккаунт</p>
          </div>
          
          <div class="card-content">
            <form class="form" @submit.prevent="handleLogin">
              <div class="input-group">
                <label for="email" class="label">
                  Email адрес
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="input"
                  placeholder="your@email.com"
                >
              </div>

              <div class="input-group">
                <label for="password" class="label">
                  Пароль
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                  class="input"
                  placeholder="Введите пароль"
                >
              </div>

              <div v-if="error" class="error-message">
                <div class="error-content">
                  <span class="error-text">{{ error }}</span>
                </div>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="submit-button"
              >
                <span v-if="loading">Вход...</span>
                <span v-else>Войти в аккаунт</span>
              </button>

              <div class="footer">
                <p class="footer-text">
                  Нет аккаунта?
                  <button
                    type="button"
                    @click="$router.push('/register')"
                    class="footer-link"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('Логин:', form.value)
    
    setTimeout(() => {
      loading.value = false
      router.push('/')
    }, 1500)
    
  } catch (err) {
    error.value = 'Ошибка входа. Проверьте email и пароль.'
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

.background-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.center-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-width: 28rem;
  margin: 0 auto;
}

.card-container {
  width: 100%;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  padding: 1.5rem 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-align: center;
  margin: 0;
}

.subtitle {
  color: #bfdbfe;
  text-align: center;
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
}

.card-content {
  padding: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  ring: 2px;
  ring-color: #3b82f6;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  color: white;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(90deg, #1d4ed8 0%, #4338ca 100%);
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.footer-link {
  color: #2563eb;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  margin-left: 0.25rem;
}

.footer-link:hover {
  color: #1d4ed8;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .background-gradient {
    padding: 0.5rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .card-header {
    padding: 1.25rem 1.5rem;
  }
}
</style>