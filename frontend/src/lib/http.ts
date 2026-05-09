import axios from 'axios'

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse

    if (body.code === 0) {
      response.data = body.data
      return response
    }

    return Promise.reject(new Error(body.msg || 'Unknown error'))
  },
  (error) => {
    if (error.response) {
      const body = error.response.data as ApiResponse | undefined
      if (body?.msg) {
        return Promise.reject(new Error(body.msg))
      }
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }
    if (!error.response) {
      return Promise.reject(new Error('网络异常，请检查网络连接'))
    }
    return Promise.reject(error)
  }
)
