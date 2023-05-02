<template>
  <div class="x-terminal-wrapper" :style="wrapperStyle">
    <div class="x-terminal" :style="mainStyle">
      <a-collapse
        v-model:activeKey="activeKey"
        :bordered="false"
        expand-icon-position="right"
      >
        <template v-for="(output, index) in outputList" :key="index">
          <!-- 折叠 -->
          <a-collapse-panel
            v-if="output.collapsible"
            :key="index"
            class="terminal-row"
          >
            <template #header>
              <span style="user-select: none; margin-right: 10px">
                {{ prompt }}
              </span>
              <span>{{ output.text }}</span>
            </template>
            <div
              v-for="(result, index) in output?.resultList"
              :key="index"
              class="terminal-row"
            >
              <content-output :output="result" />
            </div>
          </a-collapse-panel>
          <!-- 不折叠 -->
          <template v-else>
            <!-- 输出命令及结果 -->
            <template v-if="output.type === 'command'">
              <div class="terminal-row">
                <span style="user-select: none; margin-right: 10px">
                  {{ prompt }}
                </span>
                <span>{{ output.text }}</span>
              </div>
              <div
                v-for="(result, index) in output?.resultList"
                :key="index"
                class="terminal-row"
              >
                <content-output :output="result" />
              </div>
            </template>
            <!-- 打印信息 -->
            <template v-else>
              <div class="terminal-row">
                <content-output :output="output" />
              </div>
            </template>
          </template>
        </template>
      </a-collapse>
      <div class="terminal-row">
        <a-input
          ref="commandInputRef"
          v-model:value="inputCommand.text"
          :disabled="isRunning"
          class="command-input"
          :placeholder="inputCommand.placeholder"
          :bordered="false"
          autofocus
          @press-enter="doSubmitCommand"
        >
          <template #addonBefore>
            <span class="command-input-prompt">
              {{ prompt }}
            </span>
          </template>
        </a-input>
      </div>
      <div style="margin-bottom: 16px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentOutput from "./ContentOutput.vue";
import { LOCAL_USER } from "../../core/user/userConstant";
import UserType = User.UserType;
import OutputType = Xterminal.OutputType;
import CommandInputType = Xterminal.CommandInputType;
import CommandOutputType = Xterminal.CommandOutputType;
import { useTerminalConfigStore } from "../../core/terminal/config/terminalConfigStore";
import { ref, toRefs, computed, StyleValue } from "vue";

interface XterminalProps {
  height?: string | number;
  fullScreen?: boolean;
  user?: UserType;
  onSubmitCommand?: (inputText: string) => void;
}

const props = withDefaults(defineProps<XterminalProps>(), {
  height: "400px",
  fullScreen: false,
  user: LOCAL_USER as any,
});

const { user } = toRefs(props);
// 引入终端配置
const configStore = useTerminalConfigStore();
const activeKey = ref<number[]>([]);
// 输出列表
const outputList = ref<OutputType[]>([]);

const commandInputRef = ref();

/***
 * 输入提示符
 */
const prompt = computed(() => {
  return `[${user.value?.username}]$`;
});
/***
 * 初始命令
 */
const initCommand: CommandInputType = {
  text: "",
  placeholder: "",
};
/***
 * 待输入的命令
 */
const inputCommand = ref<CommandInputType>({
  ...initCommand,
});
/***
 * 全局记录当前命令，便于写入结果
 */
let currentNewCommand: CommandOutputType;

/***
 * 命令是否运行
 */
const isRunning = ref(false);
/***
 * 提交命令
 */
const doSubmitCommand = async () => {
  isRunning.value = true;
  let inputText = inputCommand.value.text;

  // 执行命令
  const newCommand: CommandOutputType = {
    text: inputText,
    type: "command",
    resultList: [],
  };
  // 记录当前命令，便于写入结果
  currentNewCommand = newCommand;
  // 执行命令
  await props.onSubmitCommand?.(inputText);
  // 添加输出 (为空也要输出换行)
  outputList.value.push(newCommand);

  //重置输入框
  inputCommand.value = { ...initCommand };
  isRunning.value = false;
};

/***
 * 终端主样式
 */
const mainStyle = computed(() => {
  const fullScreenStyle: StyleValue = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  };
  return props.fullScreen
    ? fullScreenStyle
    : {
        height: props.height,
      };
});
/***
 * 终端包装样式
 */
const wrapperStyle = computed(() => {
  const { background } = configStore;
  const style = {
    ...mainStyle.value,
  };
  style.background = background;
  return style;
});
</script>

<style scoped>
.x-terminal-wrapper {
  background: black;
}
.x-terminal {
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  overflow: scroll;
}
.x-terminal::-webkit-scrollbar {
  display: none;
}
.x-terminal span {
  font-size: 16px;
}
.x-terminal:deep(
    .ant-collaspe-icon-position-right
      > .ant-collaspe-item
      > .ant-collaspe-header
  ) {
  color: white;
  padding: 0;
}
.x-terminal :deep(.ant-collapse) {
  background: none;
}
.yu-terminal :deep(.ant-collapse-borderless > .ant-collapse-item) {
  border: none;
}

.yu-terminal :deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0;
}
.command-input {
  caret-color: white;
}
.command-input :deep(input) {
  color: white !important;
  font-size: 16px;
  padding: 0 10px;
}

.command-input :deep(.ant-input-group-addon) {
  background: none;
  border: none;
  padding: 0;
}

.command-input-prompt {
  color: white;
  background: transparent;
}

.terminal-row {
  color: white;
  font-size: 16px;
  font-family: courier-new, courier, monospace;
}
</style>
