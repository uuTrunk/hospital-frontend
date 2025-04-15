const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        port: 8081,
        proxy: {
            '/api/admission-assessment': {
                target: 'http://localhost:8083',
                changeOrigin: true,
                ws: true,
                secure: false
            },
            '/api/health-assessment': {
                target: 'http://localhost:8083',
                changeOrigin: true,
                ws: true,
                secure: false
            },
            '/api/patient-info': {
                target: 'http://localhost:8083',
                changeOrigin: true,
                ws: true,
                secure: false,
                pathRewrite: {
                    '^/api/patient-info': '/api/patient-info'
                }
            },
            '/api/discharge': {
                target: 'http://localhost:8084',
                changeOrigin: true,
                ws: true,
                secure: false,
                pathRewrite: {
                    '^/api/discharge': '/api/discharge'
                }
            }
        }
    }
}) 