import React from "react";
import Webcam from "react-webcam";
import cv from "@techstark/opencv-js";

export default function Home(){
  const [motion,setMotion] = React.useState(0);
  const webcamRef = React.useRef(null);
  let prevRef = React.useRef(null);
  let imgRef = React.useRef(null);

  // console.log(prevRef);
  if (prevRef.current == null) {
    console.log("true");
  }
  const detectFace = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    if(prevRef.current.src===null || prevRef.current.src==="" || prevRef.current.src===undefined){
      prevRef.current.src = imageSrc;
    // console.log(prevRef)

    }
    // console.log(prevRef.current.src)

    imgRef.current.src = imageSrc;
    // console.log(imgRef)
    imgRef.current.onload = () => {
      // read new frame
      const img = cv.imread(imgRef.current);
      const imgGray = new cv.Mat();
      cv.cvtColor(img, imgGray, cv.COLOR_BGR2GRAY);
      // read old frame
      const imgPrev = cv.imread(prevRef.current);
      const imgGrayPrev = new cv.Mat();
      cv.cvtColor(imgPrev, imgGrayPrev, cv.COLOR_BGR2GRAY);
      let ksize = new cv.Size(5,  5);
      // gaussian blur new
      cv.GaussianBlur(imgGray, imgGray, ksize, 0, 0, cv.BORDER_DEFAULT);
      // gaussian blur prev
      cv.GaussianBlur(imgGrayPrev, imgGrayPrev, ksize, 0, 0, cv.BORDER_DEFAULT);
      // absdiff
      let diff = new cv.Mat();
      cv.absdiff(imgGrayPrev, imgGray, diff);
      let M = cv.Mat.ones(7, 7, cv.CV_8U);
      let anchor = new cv.Point(-1, -1);
      cv.morphologyEx(diff, diff, cv.MORPH_OPEN, M, anchor, 1,
        cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
      // // close
      cv.morphologyEx(diff, diff, cv.MORPH_CLOSE, M, anchor, 1,
        cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());      // threshold
      cv.threshold(diff, diff, 10, 255,cv.THRESH_BINARY);
      // open
      
      // couting number of non zeros
     let nb= cv.countNonZero(diff)
      let avg = (nb * 100.0) / (300 * 300);
      if (avg >= 24) {
  
        setMotion("Something is moving 66!"+String(avg))
      }
      prevRef.current.src = imageSrc;
    };
 
  };
  React.useEffect(() => {
    setInterval(detectFace, 100);
  });

  return (
    <div className="App">
      <h2>Real-time Face Detection</h2>
      <Webcam
        ref={webcamRef}
        className="webcam"
        mirrored
        videoConstraints={{
          width: 300,
          height: 300,
          facingMode: "user"
        }}
        screenshotFormat="image/jpeg"
        style={{visibility: "hidden"}}
      />
      <img className="inputImage" alt="input" ref={imgRef}  style={{visibility: "hidden"}}/>
      {/* <img className="inputImage" alt="inputh" ref={prevRef} /> */}
      {/* <canvas ref={grayImgRef} /> */}
      {/* <canvas ref={greyImgRef} /> */}
      <img id="name" ref={prevRef} alt="h" style={{visibility: "hidden"}} /> 
      {motion}
    </div>
  );
}

