<template>
  <div class="container">
    <h1>Todo List</h1>
    
    <div class="todo-form">
      <input 
        type="text" 
        v-model="newTodo" 
        placeholder="添加新的待办事项..." 
        @keyup.enter="addTodo"
      >
      <button class="btn" @click="addTodo">添加</button>
    </div>
    
    <div class="todo-stats">
      <span>已完成: {{ completedCount }} / 总计: {{ todos.length }}</span>
    </div>
    
    <div class="todo-list">
      <div 
        v-for="todo in todos" 
        :key="todo.id" 
        class="todo-item" 
        :class="{ completed: todo.completed }"
      >
        <div class="todo-content">
          <input 
            type="checkbox" 
            v-model="todo.completed" 
            @change="updateTodoStatus(todo)"
          >
          <span class="todo-text">{{ todo.text }}</span>
        </div>
        <button class="btn-delete" @click="deleteTodo(todo.id)">删除</button>
      </div>
      
      <div v-if="todos.length === 0" class="todo-empty">
        暂无待办事项
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 响应式数据
const newTodo = ref('');
const todos = ref([]);
const apiUrl = 'http://localhost:8080/api/todos';
const userId = 1; // 默认用户ID

// 计算属性：已完成的待办事项数量
const completedCount = computed(() => {
  return todos.value.filter(todo => todo.completed).length;
});

// 从API加载待办事项
const loadTodos = async () => {
  try {
    const response = await fetch(`${apiUrl}?userId=${userId}`);
    if (!response.ok) {
      throw new Error('加载待办事项失败');
    }
    const data = await response.json();
    todos.value = data;
  } catch (error) {
    console.error('加载待办事项失败:', error);
    alert('加载待办事项失败，请稍后重试！');
  }
};

// 添加新的待办事项
const addTodo = async () => {
  if (newTodo.value.trim()) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newTodo.value.trim(),
          completed: false,
          userId: userId
        })
      });
      
      if (!response.ok) {
        throw new Error('添加待办事项失败');
      }
      
      const addedTodo = await response.json();
      todos.value.unshift(addedTodo);
      newTodo.value = '';
    } catch (error) {
      console.error('添加待办事项失败:', error);
      alert('添加待办事项失败，请稍后重试！');
    }
  }
};

// 更新待办事项状态
const updateTodoStatus = async (todo) => {
  try {
    const response = await fetch(`${apiUrl}/${todo.id}/status?completed=${todo.completed}`, {
      method: 'PATCH'
    });
    
    if (!response.ok) {
      throw new Error('更新待办事项状态失败');
    }
  } catch (error) {
    console.error('更新待办事项状态失败:', error);
    alert('更新待办事项状态失败，请稍后重试！');
    // 恢复原状态
    todo.completed = !todo.completed;
  }
};

// 删除待办事项
const deleteTodo = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('删除待办事项失败');
    }
    
    todos.value = todos.value.filter(todo => todo.id !== id);
  } catch (error) {
    console.error('删除待办事项失败:', error);
    alert('删除待办事项失败，请稍后重试！');
  }
};

// 组件挂载时加载待办事项
onMounted(() => {
  loadTodos();
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
}

h1 {
  text-align: center;
  color: #2e7d32;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.1);
}

.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-form input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0f2f1;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.todo-form input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  background-color: white;
}

.todo-form .btn {
  width: auto;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.todo-form .btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.todo-stats {
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #f1f8e9;
  border-radius: 8px;
  font-size: 14px;
  color: #43a047;
  font-weight: 500;
}

.todo-list {
  margin-top: 20px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
  border: 2px solid #c8e6c9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #81c784;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-content input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4caf50;
}

.todo-text {
  font-size: 15px;
  color: #2e7d32;
  line-height: 1.5;
}

.btn-delete {
  padding: 6px 12px;
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 83, 80, 0.2);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3);
}

.todo-empty {
  text-align: center;
  padding: 40px 20px;
  color: #81c784;
  font-size: 15px;
  background-color: #f1f8e9;
  border: 2px dashed #c8e6c9;
  border-radius: 12px;
}
</style>