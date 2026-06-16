<template>
  <div class="container">
    <h1>学生周报生成器</h1>
    
    <form id="reportForm">
      <div class="form-group">
        <label for="studentName">学生姓名</label>
        <input type="text" id="studentName" v-model="studentName" placeholder="请输入学生姓名" required>
      </div>
      
      <div class="form-group">
        <label for="attendanceDays">考勤天数</label>
        <input type="number" id="attendanceDays" v-model="attendanceDays" placeholder="请输入本周考勤天数" min="1" max="7" required>
      </div>
      
      <div class="form-group">
        <label for="homeworkCompleted">作业完成数</label>
        <input type="number" id="homeworkCompleted" v-model.number="homeworkCompleted" placeholder="请输入本周作业完成数" min="0" required>
      </div>
      
      <div>
        <button type="button" class="btn" @click="generateReport">生成周报</button>
        <button type="button" class="btn btn-secondary" @click="copyToClipboard">复制到剪贴板</button>
      </div>
    </form>
    
    <div class="result">{{ reportResult }}</div>
    
    <!-- 历史记录区域 -->
    <div class="history-section">
      <div class="history-header">
        <h2>历史记录</h2>
        <button type="button" class="btn btn-small" @click="clearHistory">清空历史</button>
      </div>
      <div class="history-list" id="historyList">
        <div v-if="history.length === 0" class="history-empty">暂无历史记录</div>
        <div 
          v-for="item in history" 
          :key="item.id" 
          class="history-item"
        >
          <div class="history-item-header">
            <div class="history-item-name">{{ item.studentName }}</div>
            <div class="history-item-actions">
              <span class="history-item-date">{{ item.date }}</span>
              <el-button 
                type="text" 
                size="small"
                @click.stop="deleteHistoryItem(item.id)"
                title="删除历史记录"
                danger
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div 
            class="history-item-content" 
            @click="copyHistoryItem(item.content)"
            style="cursor: pointer;"
          >
            {{ item.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

// 响应式数据
const studentName = ref('');
const attendanceDays = ref('');
const homeworkCompleted = ref(0);
const reportResult = ref('');
const history = ref([]);
// API地址配置 - 根据环境自动切换
const apiUrl = import.meta.env.VITE_API_URL || '/api/reports';

// 生成周报
const generateReport = async () => {
  if (!studentName.value || !attendanceDays.value || !homeworkCompleted.value) {
    ElMessage.warning('请填写所有必填项！');
    return;
  }
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentName: studentName.value,
        attendanceDays: parseInt(attendanceDays.value),
        homeworkCompleted: parseInt(homeworkCompleted.value)
      })
    });
    
    if (!response.ok) {
      throw new Error('生成周报失败');
    }
    
    const result = await response.json();
    reportResult.value = result.content;
    
    // 更新历史记录
    await fetchHistory();
    
    ElMessage.success('周报生成成功！');
  } catch (error) {
    console.error('生成周报失败:', error);
    ElMessage.error('生成周报失败，请稍后重试！');
  }
};

// 复制到剪贴板
const copyToClipboard = () => {
  if (!reportResult.value) {
    ElMessage.warning('请先生成周报！');
    return;
  }
  
  navigator.clipboard.writeText(reportResult.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板！');
    })
    .catch(err => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败，请手动复制！');
    });
};

// 获取历史记录
const fetchHistory = async () => {
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('获取历史记录失败');
    }
    
    const data = await response.json();
    // 将数据转换为前端需要的格式
    history.value = data.map(item => ({
      id: item.id,
      studentName: item.studentName,
      content: item.content,
      date: new Date(item.createdAt).toLocaleString('zh-CN')
    }));
  } catch (error) {
    console.error('获取历史记录失败:', error);
    ElMessage.error('获取历史记录失败，请稍后重试！');
  }
};

// 复制历史记录项
const copyHistoryItem = (content) => {
  navigator.clipboard.writeText(content)
    .then(() => {
      ElMessage.success('已复制到剪贴板！');
    })
    .catch(err => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败，请手动复制！');
    });
};

// 删除单条历史记录
const deleteHistoryItem = (id) => {
  ElMessageBox.confirm('确定要删除这条历史记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      // 调用API删除单条记录
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('删除历史记录失败');
      }
      
      // 更新本地历史记录
      await fetchHistory();
      ElMessage.success('历史记录已删除！');
    } catch (error) {
      console.error('删除历史记录失败:', error);
      ElMessage.error('删除历史记录失败，请稍后重试！');
    }
  }).catch(() => {
    // 取消操作，不做任何处理
  });
};

// 清空历史记录 - 由于是调用API，这里我们只清空本地显示，实际删除需要调用API
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空所有历史记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      // 获取所有历史记录的ID
      const allIds = history.value.map(item => item.id);
      
      // 遍历删除所有记录
      for (const id of allIds) {
        await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE'
        });
      }
      
      // 更新本地历史记录
      history.value = [];
      ElMessage.success('历史记录已清空！');
    } catch (error) {
      console.error('清空历史记录失败:', error);
      ElMessage.error('清空历史记录失败，请稍后重试！');
    }
  }).catch(() => {
    // 取消操作，不做任何处理
  });
};

// 组件挂载后显示历史记录
onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
  background-color: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.15);
  transition: transform 0.3s ease;
}

h1 {
  text-align: center;
  color: #2e7d32;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #43a047;
  font-weight: 600;
  font-size: 15px;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0f2f1;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

input[type="text"]:hover,
input[type="number"]:hover {
  border-color: #a5d6a7;
  background-color: white;
}

input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  background-color: white;
}

.btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  text-align: center;
  text-decoration: none;
  display: block;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0 0 0;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.btn-secondary {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.2);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.btn-secondary:active {
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.result {
  margin-top: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
  border: 2px solid #c8e6c9;
  border-radius: 15px;
  min-height: 120px;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.6;
  color: #2e7d32;
  box-shadow: inset 0 2px 8px rgba(76, 175, 80, 0.08);
}

.copy-message {
  margin-top: 15px;
  color: #4caf50;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.copy-message.show {
  opacity: 1;
  transform: translateY(-2px);
}

/* 历史记录区域样式 */
.history-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #e0f2f1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.history-header h2 {
  color: #2e7d32;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.btn-small {
  padding: 8px 14px;
  font-size: 13px;
  border-radius: 8px;
  white-space: nowrap;
}

.history-list {
  background-color: white;
  border: 2px solid #e0f2f1;
  border-radius: 12px;
  padding: 12px;
  max-height: 250px;
  overflow-y: auto;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #f1f8e9;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #c8e6c9;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #a5d6a7;
}

.history-item {
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
  border: 1px solid #c8e6c9;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateX(3px);
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.15);
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.history-item-name {
  font-weight: 600;
  color: #2e7d32;
  font-size: 14px;
}

.history-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-item-date {
  font-size: 11px;
  color: #81c784;
}



.history-item-content {
  font-size: 13px;
  color: #43a047;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.history-empty {
  text-align: center;
  color: #a5d6a7;
  padding: 30px 15px;
  font-size: 13px;
}
</style>
