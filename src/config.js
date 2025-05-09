// 应用配置

// 开发环境配置
const DEV_CONFIG = {
  // 本地开发时使用
  API_URL: 'http://localhost:3000'
};

// 局域网部署配置
// 注意：部署时需要将此处的 IP 地址替换为实际的服务器 IP 地址
const LAN_CONFIG = {
  API_URL: 'http://192.168.1.100:3000' // 替换为您的实际 IP 地址
};

// 生产环境配置
const PROD_CONFIG = {
  API_URL: '/api' // 使用相对路径，避免跨域问题
};

// 根据环境变量选择配置
let CONFIG;
if (process.env.VUE_APP_ENV === 'production') {
  CONFIG = PROD_CONFIG;
} else if (process.env.VUE_APP_ENV === 'lan') {
  CONFIG = LAN_CONFIG;
} else {
  CONFIG = DEV_CONFIG;
}

export default CONFIG;
