<template>
  <button @click="startRecording()">
    {{ btnText }}
  </button>
  <br/>
  实时识别结果：{{ resultText }}
</template>

<script setup>
import {ref} from "vue";
import '/src/voice-utils/utilJS/crypto-js.js'; //鉴权的引用地址
import '/src/voice-utils/utilJS/index.umd.js'; // 调用Web Speech API 的依赖，应该是官方的写的工具类
const btnText = ref("开始录音");
const btnStatus =  ref("UNDEFINED"); // "UNDEFINED" "CONNECTING" "OPEN" "CLOSING" "CLOSED"
const recorder = new RecorderManager('/src/voice-utils/dist')
const APPID = "XXX"; // TODO 你的讯飞模型APPID
const API_SECRET = "XXX"; // TODO 你的讯飞模型API_SECRET
const API_KEY = "XXX"; // TODO 你的讯飞模型API_KEY
let iatWS; //监听录音的变量
let resultText = ref(''); // 识别结果
let resultTextTemp = ref('');
let countdownInterval;
// 生成 WebSocket URL 生成规则由平台决定
function getWebSocketUrl() {
  // 请求地址根据语种不同变化
  var url = "wss://iat-api.xfyun.cn/v2/iat";
  var host = "iat-api.xfyun.cn";
  var apiKey = API_KEY;
  var apiSecret = API_SECRET;
  var date = new Date().toGMTString();
  var algorithm = "hmac-sha256";
  var headers = "host date request-line";
  var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  var signature = CryptoJS.enc.Base64.stringify(signatureSha);
  var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  var authorization = btoa(authorizationOrigin);
  url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
  return url;
}
// 加密工具函数
function toBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
// 计数函数
function countdown() {
  let seconds = 60;
  btnText.value = `录音中（${seconds}s）`;
  countdownInterval = setInterval(() => {
    seconds = seconds - 1;
    if (seconds <= 0) {
      clearInterval(countdownInterval);
      recorder.stop();
    } else {
      btnText.value = `录音中（${seconds}s）`;
    }
  }, 1000);
}
// 录音状态变化函数
function changeStatus(status) {
  btnStatus.value = status;
  if (status === "CONNECTING") {
    btnText.value = "建立连接中";
    resultText.value = '';
    resultTextTemp.value = "";
  } else if (status === "OPEN") {
    countdown();
  } else if (status === "CLOSING") {
    btnText.value = "关闭连接中";
  } else if (status === "CLOSED") {
    btnText.value = "开始录音";
  }
}
// 结果解析函数
function renderResult(resultData) {
  // 识别结束
  let jsonData = JSON.parse(resultData);
  if (jsonData.data && jsonData.data.result) {
    let data = jsonData.data.result;
    let str = "";
    let ws = data.ws;
    for (let i = 0; i < ws.length; i++) {
      str = str + ws[i].cw[0].w;
    }
    // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
    // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
    if (data.pgs) {
      if (data.pgs === "apd") {
        // 将resultTextTemp同步给resultText
        resultText.value = resultTextTemp;
      }
      // 将结果存储在resultTextTemp中
      resultTextTemp.value = resultText.value + str;
    } else {
      resultText.value = resultText.value + str;
    }
  }
  if (jsonData.code === 0 && jsonData.data.status === 2) {
    iatWS.close();
  }
  if (jsonData.code !== 0) {
    iatWS.close();
    console.error(jsonData);
  }
}
// 连接 WebSocket
function connectWebSocket() {
  const websocketUrl = getWebSocketUrl();
  if ("WebSocket" in window) {
    iatWS = new WebSocket(websocketUrl);
  } else if ("MozWebSocket" in window) {
    iatWS = new MozWebSocket(websocketUrl);
  } else {
    alert("浏览器不支持WebSocket");
    return;
  }
  changeStatus("CONNECTING");
  iatWS.onopen = (e) => {
    // 开始录音
    recorder.start({
      sampleRate: 16000,
      frameSize: 1280,
    });
    var params = {
      common: {
        app_id: APPID,
      },
      business: {
        language: "zh_cn",
        domain: "iat",
        accent: "mandarin",
        vad_eos: 5000,
        dwa: "wpgs",
      },
      data: {
        status: 0,
        format: "audio/L16;rate=16000",
        encoding: "raw",
      },
    };
    iatWS.send(JSON.stringify(params));
  };
  iatWS.onmessage = (e) => {
    renderResult(e.data);
  };
  iatWS.onerror = (e) => {
    console.error(e);
    recorder.stop();
    changeStatus("CLOSED");
  };
  iatWS.onclose = (e) => {
    recorder.stop();
    changeStatus("CLOSED");
  };
}
// 定义监听开始的函数
recorder.onStart = () => {
  changeStatus("OPEN");
}
// 处理回调的结果
recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
  if (iatWS.readyState === iatWS.OPEN) {
    iatWS.send(
        JSON.stringify({
          data: {
            status: isLastFrame ? 2 : 1,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: toBase64(frameBuffer),
          },
        })
    );
    if (isLastFrame) {
      changeStatus("CLOSING");
    }
  }
};
// 停止录音的处理
recorder.onStop = () => {
  clearInterval(countdownInterval);
};
// 按钮点击的启动 | 结束函数
const startRecording = () => {
  if (btnStatus.value === "UNDEFINED" || btnStatus.value === "CLOSED") {
    connectWebSocket();
  } else if (btnStatus.value === "CONNECTING" || btnStatus.value === "OPEN") {
    // 结束录音
    recorder.stop();
  }
}
</script>

<style scoped>

</style>
