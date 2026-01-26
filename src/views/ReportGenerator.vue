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
          @click="copyHistoryItem(item.content)"
        >
          <div class="history-item-header">
            <div class="history-item-name">{{ item.studentName }}</div>
            <div class="history-item-date">{{ item.date }}</div>
          </div>
          <div class="history-item-content">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 响应式数据
const studentName = ref('');
const attendanceDays = ref('');
const homeworkCompleted = ref(0);
const reportResult = ref('');
const history = ref([]);

// 生成周报
const generateReport = () => {
  if (!studentName.value || !attendanceDays.value || !homeworkCompleted.value) {
    ElMessage.warning('请填写所有必填项！');
    return;
  }
  
  // 根据作业完成情况生成评价
  let evaluation;
  if (homeworkCompleted.value >= 8) {
    evaluation = '作业完成情况优秀，学习态度非常认真，继续保持！';
  } else if (homeworkCompleted.value >= 5) {
    evaluation = '作业完成情况良好，学习态度积极，建议继续努力！';
  } else if (homeworkCompleted.value >= 3) {
    evaluation = '作业完成情况一般，需要提高学习效率，加强时间管理！';
  } else {
    evaluation = '作业完成情况较差，学习态度需要改善，建议家长和老师加强督促！';
  }
  
  const reportText = `【学生周报】${studentName.value}同学本周表现:出勤${attendanceDays.value}天，完成作业${homeworkCompleted.value}份。${evaluation}`;
  
  reportResult.value = reportText;
  
  // 保存到历史记录
  saveToHistory(studentName.value, reportText);
  
  ElMessage.success('周报生成成功！');
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

// 保存到历史记录
const saveToHistory = (name, content) => {
  // 获取现有历史记录
  const existingHistory = getHistory();
  
  // 创建新的历史记录项
  const historyItem = {
    id: Date.now(),
    studentName: name,
    content: content,
    date: new Date().toLocaleString('zh-CN')
  };
  
  // 添加到历史记录开头
  existingHistory.unshift(historyItem);
  
  // 限制历史记录数量为20条
  if (existingHistory.length > 20) {
    existingHistory.pop();
  }
  
  // 保存到localStorage
  localStorage.setItem('studentReportHistory', JSON.stringify(existingHistory));
  
  // 更新历史记录显示
  displayHistory();
};

// 获取历史记录
const getHistory = () => {
  const historyData = localStorage.getItem('studentReportHistory');
  return historyData ? JSON.parse(historyData) : [];
};

// 显示历史记录
const displayHistory = () => {
  history.value = getHistory();
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

// 清空历史记录
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空所有历史记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    localStorage.removeItem('studentReportHistory');
    displayHistory();
    ElMessage.success('历史记录已清空！');
  }).catch(() => {
    // 取消操作，不做任何处理
  });
};

// 组件挂载后显示历史记录
onMounted(() => {
  displayHistory();
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
