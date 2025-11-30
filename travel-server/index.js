const express = require('express');
const cors = require('cors');
const axios = require('axios');  // 添加这行！
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// 使用本地JSON存储代替MongoDB
const localDB = require('./utils/localDB');
const { sendSMSCode, verifySMSCode } = require('./utils/smsCode');
const { generateToken, authenticateToken, optionalAuth } = require('./middleware/auth');
const { 
  findUserByPhone,
  findUserById,      // <--- 必须有这个
  createUser,
  updateUser,
  updateLastLogin,
  createRoute,
  getUserRoutes,
  getRoutes,
} = require('./utils/localDB');
const app = express();
const PORT = process.env.PORT || 5000;


// 1. 配置静态资源服务 (让uploads文件夹可访问)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 中间件
app.use(cors());
app.use(express.json());

// 你的百炼API Key
// 从.env读取API Key
const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY;

console.log('✅ 使用本地JSON文件存储数据');
// 6. 上传图片
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 接口地址: /api/upload
// 接收字段: avatar

// 获取本机 IP 的辅助函数
function getLocalIP() {
  // ⚠️ 强制返回你确认能用的那个 WiFi IP
  // 如果你不想每次都改，保留原来的逻辑也可以，但要确保它取对
  return '192.168.1.31'; 
}

// 3. 添加上传接口
// 上传接口
app.post('/api/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '请选择文件' });
  }
  
  // 使用请求头中的 host，这样前端用什么 IP 访问的，返回的就是什么 IP
  // 比如前端访问 http://192.168.1.31:5000/...
  // 这里 req.headers.host 就是 192.168.1.31:5000
  const baseUrl = req.headers.host; 
  const fileUrl = `http://${baseUrl}/uploads/${req.file.filename}`;
  
  console.log('📸 图片上传成功:', fileUrl);
  
  res.json({
    success: true,
    url: fileUrl
  });
});
// =================== 用户认证接口 ===================

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }
    
    // 发送验证码
    await sendSMSCode(phone);
    
    res.json({
      success: true,
      message: '验证码已发送',
      expiresIn: 300
    });
    
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送失败，请稍后重试'
    });
  }
});

// 登录/注册
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    console.log('📱 登录请求:', phone);
    
    // 验证验证码
    const verifyResult = verifySMSCode(phone, code);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message
      });
    }
    
    // 查找或创建用户（使用本地存储）
    let user = localDB.findUserByPhone(phone);
    let isNewUser = false;
    
    if (!user) {
      // 新用户注册
      user = localDB.createUser({ phone });
      isNewUser = true;
      console.log('📝 新用户注册:', phone);
    } else {
      // 更新最后登录时间
      localDB.updateLastLogin(user._id);
      console.log('✅ 用户登录:', phone);
    }
    
    // 生成Token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: isNewUser ? '注册成功' : '登录成功',
      data: {
        token,
        user: {
          _id: user._id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          isNewUser
        }
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 获取用户信息
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = localDB.findUserById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败'
    });
  }
});

// 更新用户信息
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { nickname, avatar, gender, signature, preferences } = req.body;
    
    const user = localDB.updateUser(req.userId, {
      nickname,
      avatar,
      gender,
      signature,
      preferences
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '更新成功',
      data: user
    });
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});


// 根路由
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ 旅游攻略App后端运行正常', 
    version: '1.0.0',
    storage: '本地JSON文件',
    timestamp: new Date().toISOString()
  });
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: '后端API连接成功' 
  });
});


// 测试认证接口
app.get('/api/auth/test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: '认证成功',
    userId: req.userId
  });
});

// AI测试接口
app.post('/api/ai/test', async (req, res) => {
  const axios = require('axios');
  
  try {
    console.log('收到AI测试请求:', req.body);
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: req.body.message || '你好，请介绍一下大理'
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BAILIAN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({
      success: true,
      data: response.data.output.choices[0].message.content,
      usage: response.data.usage
    });
    
  } catch (error) {
    console.error('AI调用失败:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 修改启动服务器部分
app.listen(PORT, '0.0.0.0', () => {  // 添加 '0.0.0.0'
  console.log(`\n🚀 服务器启动成功！`);
  console.log(`📡 本地访问: http://localhost:${PORT}`);
  
  // 显示所有可用的网络地址
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach(name => {
    networkInterfaces[name].forEach(net => {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`📡 网络访问: http://${net.address}:${PORT}`);
      }
    });
  });
  
  console.log(`🧪 测试地址: http://localhost:${PORT}/api/test`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
// 5. 删除路线
app.delete('/api/routes/:id', authenticateToken, (req, res) => {
  // 调用 localDB.deleteRoute
  console.log('尝试删除路线:', req.params.id);
  console.log('当前用户ID:', req.userId);
  const success = localDB.deleteRoute(req.params.id, req.userId);
  console.log('删除结果:', success);
  if (success) {
    res.json({ success: true, message: '删除成功' });
  } else {
    // 如果路线不存在或不是自己的，返回 404
    res.status(404).json({ success: false, message: '删除失败: 路线不存在或无权删除' });
  }
});
// =================== 路线发布接口 ===================

// 发布路线
// 3. 发布路线
app.post('/api/routes/publish', authenticateToken, (req, res) => {
  // ✅ 关键修改：添加 isPublic 和 images 到解构列表
  const { destination, title, content, days, budget, tags, isPublic, images } = req.body;
  
  if (!destination || !title) {
    return res.json({ success: false, message: '信息不完整' });
  }

  const user = localDB.findUserById(req.userId);
  if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

  const newRoute = localDB.createRoute({
    userId: req.userId,
    author: { nickname: user.nickname, avatar: user.avatar },
    destination,
    title,
    content,
    days,
    budget,
    tags: tags || [], // 防止 undefined
    isPublic: isPublic === undefined ? true : isPublic, // 默认公开
    images: images || [] // 防止 undefined
  });

  res.json({ success: true, data: newRoute });
});

// 获取我的发布
app.get('/api/routes/my-published', authenticateToken, (req, res) => {
  try {
    const routes = getUserRoutes(req.userId);
    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取失败'
    });
  }
});

// 抖音链接提取接口 - AI智能版
app.post('/api/douyin/extract', async (req, res) => {
  const { link } = req.body;
  
  console.log('\n=================== 新请求 ===================');
  console.log('📱 收到抖音链接:', link);
  console.log('⏰ 时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    // 步骤1: 智能识别目的地和关键信息
    console.log('🔍 正在分析链接...');
    
    // 从链接文本智能提取信息（简化版本）
    // 实际项目中这里应该调用抖音API或爬虫获取视频信息
    let videoContext = {
      destination: '',
      keywords: [],
      duration: ''
    };
    
    // 使用AI分析链接，智能识别目的地
    const analyzePrompt = `
分析这个抖音分享链接，猜测可能的旅游目的地。
链接：${link}

如果链接中包含地名线索，请识别出来。如果没有明确信息，请根据常见的旅游热门地推荐一个。

请返回JSON格式：
{
  "destination": "目的地名称",
  "keywords": ["关键词1", "关键词2"],
  "suggestedDays": "建议天数"
}
`;

    console.log('🤖 调用AI分析链接...');
    
    // 第一次AI调用：分析链接
    const analyzeResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个旅游内容分析专家，擅长从有限的信息中推断旅游目的地和相关信息。'
            },
            {
              role: 'user',
              content: analyzePrompt
            }
          ]
        },
        parameters: {
          result_format: 'message',
          temperature: 0.5
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BAILIAN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 解析分析结果
    try {
      const analyzeContent = analyzeResponse.data.output.choices[0].message.content;
      const jsonMatch = analyzeContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoContext = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('⚠️ 分析结果解析失败，使用默认值');
      // 随机选择一个热门目的地
      const hotDestinations = [
        { destination: '大理', keywords: ['洱海', '古城', '苍山'], suggestedDays: '4-5天' },
        { destination: '三亚', keywords: ['海滩', '潜水', '海鲜'], suggestedDays: '3-4天' },
        { destination: '成都', keywords: ['熊猫', '火锅', '宽窄巷子'], suggestedDays: '3-4天' },
        { destination: '厦门', keywords: ['鼓浪屿', '环岛路', '海鲜'], suggestedDays: '3-4天' },
        { destination: '西安', keywords: ['兵马俑', '回民街', '古城墙'], suggestedDays: '3-4天' }
      ];
      videoContext = hotDestinations[Math.floor(Math.random() * hotDestinations.length)];
    }
    
    console.log('📍 识别结果:', videoContext);
    
    // 步骤2: 生成详细的旅游攻略
    const planPrompt = `
你是一位资深的旅游规划师，请为【${videoContext.destination}】制定一份详细实用的旅游攻略。

背景信息：
- 目的地：${videoContext.destination}
- 相关关键词：${videoContext.keywords?.join('、') || '自由行'}
- 建议时长：${videoContext.suggestedDays || '3-5天'}

要求：
1. 行程安排要合理，不要太赶
2. 包含当地必去景点和特色体验
3. 推荐地道的美食，不要只推荐游客餐厅
4. 住宿建议要包含具体区域
5. 交通方式要详细实用
6. 预算要贴合实际
7. 根据季节给出合适建议（假设是当前季节）

请生成JSON格式的旅游攻略：
{
  "destination": "${videoContext.destination}",
  "duration": "X天X晚",
  "budget": "XXXX-XXXX元/人",
  "bestSeason": "最佳旅游季节",
  "summary": "50-100字的行程亮点概述",
  "dailyPlan": [
    {
      "day": 1,
      "theme": "第一天的主题",
      "activities": [
        {
          "time": "09:00",
          "place": "具体景点名称",
          "description": "详细的活动安排和游玩建议",
          "duration": "建议游玩时长",
          "cost": "门票价格"
        }
      ],
      "meals": {
        "breakfast": "早餐推荐（包含地点和特色）",
        "lunch": "午餐推荐（包含地点和特色）",
        "dinner": "晚餐推荐（包含地点和特色）"
      },
      "accommodation": "住宿区域建议和理由"
    }
  ],
  "transportation": {
    "toDestination": "详细的到达方式（飞机/高铁/自驾）",
    "local": "当地交通攻略（地铁/公交/打车/租车）",
    "tips": "交通小贴士"
  },
  "packingList": ["物品1", "物品2", "物品3"],
  "foodRecommend": [
    {
      "name": "美食名称",
      "location": "推荐餐厅或地点",
      "price": "人均价格"
    }
  ],
  "tips": [
    "实用建议1",
    "实用建议2",
    "实用建议3"
  ],
  "avoidPits": [
    "避坑指南1",
    "避坑指南2"
  ]
}

注意：请直接返回JSON，不要有其他解释文字。`;

    console.log('🎯 正在生成详细攻略...');
    
    // 第二次AI调用：生成攻略
    const planResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一位经验丰富的旅游规划师，去过中国所有主要旅游城市，了解各地的特色景点、美食、文化。你的攻略实用、详细、贴近当地生活。'
            },
            {
              role: 'user',
              content: planPrompt
            }
          ]
        },
        parameters: {
          result_format: 'message',
          temperature: 0.8,  // 稍微提高创造性
          max_tokens: 3000   // 允许更长的回复
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${BAILIAN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 解析生成的攻略
    let travelPlan;
    const planContent = planResponse.data.output.choices[0].message.content;
    console.log('📝 AI原始返回长度:', planContent.length, '字符');
    
    try {
      // 尝试提取JSON
      const jsonMatch = planContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        travelPlan = JSON.parse(jsonMatch[0]);
        console.log('✅ 攻略解析成功');
      } else {
        travelPlan = JSON.parse(planContent);
      }
      
      // 确保必要字段存在
      if (!travelPlan.dailyPlan || travelPlan.dailyPlan.length === 0) {
        throw new Error('攻略格式不完整');
      }
      
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError.message);
      console.log('📄 原始内容前500字符:', planContent.substring(0, 500));
      
      // 使用备用攻略
      travelPlan = generateSmartDefaultPlan(videoContext.destination);
    }
    
    // 添加额外信息
    travelPlan.generatedAt = new Date().toISOString();
    travelPlan.aiVersion = 'qwen-turbo';
    
    // 计算token使用量
    const totalTokens = 
      (analyzeResponse.data.usage?.total_tokens || 0) + 
      (planResponse.data.usage?.total_tokens || 0);
    
    console.log('📊 Token使用:', {
      分析: analyzeResponse.data.usage?.total_tokens || 0,
      生成: planResponse.data.usage?.total_tokens || 0,
      总计: totalTokens
    });
    
    // 返回成功响应
    res.json({
      success: true,
      travelPlan: travelPlan,
      videoInfo: {
        title: `${videoContext.destination}旅游攻略`,
        description: `AI为您智能生成的${videoContext.destination}深度游攻略`,
        link: link,
        analyzedContext: videoContext
      },
      usage: {
        tokensUsed: totalTokens,
        cost: `约 ${(totalTokens * 0.000008).toFixed(4)} 元`  // 估算成本
      }
    });
    
    console.log('✅ 攻略生成成功！');
    console.log('=================== 请求完成 ===================\n');
    
  } catch (error) {
    console.error('❌ 生成攻略失败:', error.message);
    
    if (error.response) {
      console.error('API错误详情:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    // 即使AI失败，也返回一个基础攻略
    const fallbackPlan = generateSmartDefaultPlan();
    
    res.json({
      success: true,
      travelPlan: fallbackPlan,
      videoInfo: {
        title: `${fallbackPlan.destination}旅游攻略`,
        description: 'AI暂时无法响应，为您提供精选攻略',
        link: link
      },
      error: 'AI服务暂时不可用，显示预设攻略'
    });
  }
});

// 智能默认攻略生成器
function generateSmartDefaultPlan(destination = '大理') {
  const destinations = {
    '大理': {
      duration: '4天3晚',
      budget: '2000-3000元/人',
      bestSeason: '3-5月，9-11月',
      summary: '大理，一个让人放慢脚步的地方。苍山洱海的自然风光，古城的悠闲时光，白族的特色美食，每一处都值得细细品味。',
      highlights: ['洱海骑行', '古城漫步', '苍山索道', '喜洲古镇']
    },
    '三亚': {
      duration: '5天4晚',
      budget: '3000-5000元/人',
      bestSeason: '10月-次年4月',
      summary: '三亚，中国的热带天堂。细软的沙滩，清澈的海水，丰富的海鲜，奢华的酒店，这里是度假的完美选择。',
      highlights: ['亚龙湾', '蜈支洲岛', '南山寺', '天涯海角']
    },
    '成都': {
      duration: '4天3晚',
      budget: '1500-2500元/人',
      bestSeason: '3-6月，9-11月',
      summary: '成都，一座来了就不想走的城市。熊猫的萌态，火锅的麻辣，茶馆的悠闲，古街的韵味，让人流连忘返。',
      highlights: ['熊猫基地', '宽窄巷子', '锦里', '都江堰']
    }
  };
  
  const info = destinations[destination] || destinations['大理'];
  
  return {
    destination: destination,
    duration: info.duration,
    budget: info.budget,
    bestSeason: info.bestSeason,
    summary: info.summary,
    dailyPlan: [
      {
        day: 1,
        theme: '初识' + destination,
        activities: [
          {
            time: '14:00',
            place: destination + '机场/车站',
            description: '抵达' + destination + '，前往酒店办理入住',
            duration: '1小时',
            cost: '交通费约50元'
          },
          {
            time: '16:00',
            place: destination + '市区',
            description: '熟悉周边环境，品尝当地小吃',
            duration: '2小时',
            cost: '人均50-100元'
          }
        ],
        meals: {
          breakfast: '自理',
          lunch: '飞机餐/火车餐',
          dinner: '当地特色餐厅，人均60-80元'
        },
        accommodation: '建议住在市中心或景区附近，方便出行'
      },
      {
        day: 2,
        theme: '深度探索',
        activities: [
          {
            time: '09:00',
            place: info.highlights[0],
            description: '游览经典景点',
            duration: '3小时',
            cost: '门票约100元'
          },
          {
            time: '14:00',
            place: info.highlights[1],
            description: '下午继续游览',
            duration: '3小时',
            cost: '门票约80元'
          }
        ],
        meals: {
          breakfast: '酒店早餐',
          lunch: '景区附近餐厅',
          dinner: '当地美食街'
        }
      }
    ],
    transportation: {
      toDestination: '飞机直达或高铁中转',
      local: '地铁、公交、打车都很方便',
      tips: '建议下载当地出行App'
    },
    packingList: ['身份证', '充电宝', '防晒用品', '常用药品', '舒适的鞋子'],
    foodRecommend: [
      { name: '特色小吃', location: '老街/夜市', price: '20-50元' },
      { name: '地方菜', location: '当地餐厅', price: '60-100元' }
    ],
    tips: [
      '提前预订住宿，避免涨价',
      '下载离线地图，方便导航',
      '准备些现金，部分小店不支持电子支付'
    ],
    avoidPits: [
      '不要在景区购买特产，价格虚高',
      '打车时要求打表，避免被宰'
    ]
  };
}