declare namespace Xterminal {
  /***
   * 输出状态
   */
  type OutputStatusType = "info" | "success" | "warning" | "error" | "system";
  /***
   * 输出类型
   */
  interface OutputType {
    type: "text" | "command" | "component";
    text?: string;
    resultList?: OutputType[];
    component?: any;
    status?: OutputStatusType;
    props?: any;
    collapsible?: boolean;
  }
  /***
   * 命令输入类型
   */
  interface CommandInputType {
    text: string;
    placeholder?: string;
  }
}
