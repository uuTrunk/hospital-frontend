import axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'

// 创建axios实例
const service = axios.create({
    baseURL: '/api',
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在这里可以添加token等认证信息
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        console.log('原始响应:', response)
        // 如果响应成功但没有data字段，返回整个响应
        if (!response.data) {
            return response
        }
        // 如果响应数据中包含code字段
        if (response.data.code !== undefined) {
            if (response.data.code === 200) {
                return response.data
            } else {
                Message.error(response.data.message || '请求失败')
                return Promise.reject(new Error(response.data.message || '请求失败'))
            }
        }
        // 如果响应数据中不包含code字段，直接返回数据
        return {
            code: 200,
            data: response.data
        }
    },
    error => {
        console.error('响应错误:', error)
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    Message.error('未登录或登录已过期，请重新登录')
                    localStorage.removeItem('token')
                    router.push('/login')
                    break
                case 403:
                    Message.error('没有权限访问该资源')
                    break
                case 404:
                    Message.error('请求的资源不存在')
                    break
                case 500:
                    Message.error('服务器错误，请稍后重试')
                    break
                default:
                    Message.error(error.response.data.message || '未知错误')
            }
        } else if (error.code === 'ECONNABORTED') {
            Message.error('请求超时，请检查网络连接')
        } else {
            Message.error('网络错误，请检查网络连接')
        }
        return Promise.reject(error)
    }
)

export default service 