<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <h1>计算器</h1>
    <div class="calculator">
      <div class="display">{{ display }}</div>
      <div class="buttons">
        <button @click="clear">C</button>
        <button @click="backspace">&lt;</button>
        <button @click="setOperator('%')">%</button>
        <button @click="setOperator('/')" class="operator">/</button>
        
        <button @click="append('7')">7</button>
        <button @click="append('8')">8</button>
        <button @click="append('9')">9</button>
        <button @click="setOperator('*')" class="operator">*</button>
        
        <button @click="append('4')">4</button>
        <button @click="append('5')">5</button>
        <button @click="append('6')">6</button>
        <button @click="setOperator('-')" class="operator">-</button>
        
        <button @click="append('1')">1</button>
        <button @click="append('2')">2</button>
        <button @click="append('3')">3</button>
        <button @click="setOperator('+')" class="operator">+</button>
        
        <button @click="append('0')" class="zero">0</button>
        <button @click="append('.')">.</button>
        <button @click="calculate" class="equals">=</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const display = ref('0');
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// 添加数字或小数点
const append = (value) => {
  if (waitingForSecondOperand) {
    display.value = value;
    waitingForSecondOperand = false;
  } else {
    display.value = display.value === '0' ? value : display.value + value;
  }
};

// 设置操作符
const setOperator = (nextOperator) => {
  const inputValue = parseFloat(display.value);
  
  // 如果已经有操作符，先执行之前的计算
  if (operator && waitingForSecondOperand === false) {
    const result = calculateResult(firstOperand, inputValue, operator);
    display.value = result.toString();
    firstOperand = result;
  } else {
    // 保存第一个操作数
    firstOperand = inputValue;
  }
  
  // 准备输入第二个操作数
  waitingForSecondOperand = true;
  operator = nextOperator;
};

// 执行计算
const calculate = () => {
  if (firstOperand === null || operator === null) {
    return;
  }
  
  const secondOperand = parseFloat(display.value);
  const result = calculateResult(firstOperand, secondOperand, operator);
  
  display.value = result.toString();
  operator = null;
  firstOperand = null;
  waitingForSecondOperand = true;
};

// 计算结果的辅助函数
const calculateResult = (first, second, op) => {
  switch (op) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      return first / second;
    case '%':
      return first % second;
    default:
      return second;
  }
};

// 清空
const clear = () => {
  display.value = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
};

// 退格
const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = '0';
  }
};
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

.calculator {
  max-width: 350px;
  margin: 0 auto;
  background-color: #2e3a46;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.display {
  background-color: #1c262f;
  color: white;
  font-size: 32px;
  font-weight: bold;
  text-align: right;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
  min-height: 60px;
  word-wrap: break-word;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

button {
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:hover {
  background-color: #2d3748;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

button.operator {
  background-color: #ed8936;
}

button.operator:hover {
  background-color: #dd6b20;
}

button.equals {
  background-color: #48bb78;
  grid-row: span 2;
}

button.equals:hover {
  background-color: #38a169;
}

button.zero {
  grid-column: span 2;
}
</style>
