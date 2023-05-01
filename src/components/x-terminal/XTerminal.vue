<template>
  <div class="x-terminal-wrapper" :style="wrapperStyle">
    <div class="x-terminal" :style="mainStyle">
      <a-collapse
        v-model:activeKey="activeKey"
        :bordered="false"
        expand-icon-position="right"
      >
        <template v-for="(output, index) in OutputList" :key="index">
          <a-collapse-panel>
            <div
              v-for="(result, index) in output?.resultList"
              :key="index"
              class="terminal-row"
            >
              <content-output :output="result" />
            </div>
          </a-collapse-panel>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import ContentOutput from "./ContentOutput.vue";
import { LOCAL_USER } from "../../core/user/userConstant";
import UserType = User.UserType;
import OutputType = Xterminal.OutputType;
import CommandInputType = Xterminal.CommandInputType;
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
const OutputList = ref<OutputType[]>([]);

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
 * 命令是否运行
 */
const isRunning = ref(false);
/***
 * 提交命令
 */
const doSubmitCommand = async () => {
  isRunning.value = true;
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
.x-terminal:deep(
    .ant-collaspe-icon-position-right
      > .ant-collaspe-item
      > .ant-collaspe-header
  ) {
  color: white;
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
