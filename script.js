const video = document.getElementById('video') // 获取video标签元素

Promise.all([ // 并行加载模型
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'), // 加载小型面部检测器模型
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'), // 加载面部68个关键点检测模型
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'), // 加载面部识别模型
  faceapi.nets.faceExpressionNet.loadFromUri('./models') // 加载面部表情识别模型
]).then(startVideo) // 所有模型加载完成后执行startVideo函数

async function startVideo() { // 异步函数用于启动视频流
  // 使用getUserMedia获取媒体流
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) { // 成功获取媒体流后的处理
      // 将媒体流赋给video标签的srcObject属性
      video.srcObject = stream;
      video.onloadedmetadata = function (e) { // 视频元数据加载完成后的处理
        video.play(); // 播放视频
      };
    })
    .catch(function (err) { // 获取媒体流失败时的处理
      console.log("Error: " + err); // 输出错误信息
    });
}

video.addEventListener('play', () => { // 监听视频播放事件
  const canvas = faceapi.createCanvasFromMedia(video) // 创建用于绘制检测结果的canvas元素
  console.info("canvas:"+canvas);

  document.body.append(canvas) // 将canvas元素添加到body中
  const displaySize = { width: video.width, height: video.height } // 设置显示尺寸为视频的尺寸
  console.info("displaySize:"+displaySize);

  faceapi.matchDimensions(canvas, displaySize) // 匹配canvas元素的尺寸和显示尺寸

  setInterval(async () => { // 每100毫秒执行一次的定时器
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions() // 使用加载的模型检测人脸及关键点、表情
    // console.log("detections:"+detections)

    const resizedDetections = faceapi.resizeResults(detections, displaySize) // 将检测结果根据显示尺寸进行缩放
    // console.log("resizedDetections:"+resizedDetections)

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) // 清空canvas
    faceapi.draw.drawDetections(canvas, resizedDetections) // 绘制检测框
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections) // 绘制人脸关键点
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // 绘制人脸表情
  }, 200) // 设置定时器间隔为100毫秒
})
