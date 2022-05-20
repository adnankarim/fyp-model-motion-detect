import React, { useState, useEffect, useRef } from "react";
import Motion from 'react-motion-detect/dist';
import axios from 'axios';
import Webcam from "react-webcam";
const App = () => {


  const webcamRef = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [pred, setPred] = React.useState({label:"",prob:0});


  const onMotion = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc.split("data:image/jpeg;base64,")[1]);
    const headers = {
      'Content-Type': 'application/json',
    }
    
    axios.post('https://model-cnn.herokuapp.com/', {"image":imageSrc.split("data:image/jpeg;base64,")[1]}, {
        headers: headers
      })
      .then((res)=>{
        console.log(res.data);
        if (res.data.probs>=0.95){
          setPred({
            label:res.data["name"],
            prob:res.data["probs"]
          })
        }else{
          setPred({
            label:"No Object Detected",
            prob:"100"
          })
        }
      
    }
        )
      console.log('I get called when motion is detected')
  }

  return <><Motion detectInterval={100} motionThreashold={15000} minTimeBetween={2000} onMotion={onMotion} />
  <Webcam
  style={{visibility: 'hidden'}}
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
     
      {imgSrc && (
        <img
          src={"data:image/jpeg;base64,"+imgSrc}
        />
      )}
      <div style={{textAlign: 'center'}}>
       {pred["label"]}--{pred["prob"]}
    </div>
  </>
}


export default App;
