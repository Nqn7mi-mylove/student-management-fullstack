import { defineStore } from 'pinia'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null
  },

  actions: {
    async login(credentials) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.post(`${apiUrl}/auth/login`, credentials)
        const { token, user } = response.data
        
        if (!token || !user || !user.role) {
          throw new Error('Invalid response format from server')
        }
        
        // 更新状态
        this.token = token
        this.user = user
        
        // 保存到本地存储
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('userRole', user.role)
        
        // 设置 axios 默认 header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
    },

    async getCurrentUser() {
      try {
        const response = await axios.get(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return response.data
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout()
        }
        throw error
      }
    }
  }
})
