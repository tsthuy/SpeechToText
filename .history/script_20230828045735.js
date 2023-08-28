const recordBtn = document.querySelector(".record"),
  result = document.querySelector(".result"),
  downloadBtn = document.querySelector(".download"),
  inputLanguage = document.querySelector("#language"),
  clearBtn = document.querySelector(".clear");
var savedTextsElement = document.getElementById('savedTexts');
var viewSavedTextsButton = document.getElementById('viewSavedTexts');
let SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;
var finalResult = ''; // Biến để lưu trữ kết quả cuối cùng

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    inputLanguage.appendChild(option);
  });
}

populateLanguages();

function saveText(text) {
  // Kiểm tra xem localStorage đã được hỗ trợ trong trình duyệt hay chưa
  if (typeof Storage !== 'undefined') {
    // Lưu kết quả cuối cùng vào localStorage
    localStorage.setItem('savedText', text);
  } else {
    console.log('LocalStorage không được hỗ trợ trong trình duyệt.');
  }
}

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;
    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      //detect when intrim results
      if (event.results[0].isFinal) {
        finalResult = speechResult; // Lưu kết quả cuối cùng
        result.innerHTML += " " + speechResult;
        result.querySelector("p").remove();
      } else {
        //creative p with class interim if not already there
        if (!document.querySelector(".interim")) {
          const interim = document.createElement("p");
          interim.classList.add("interim");
          result.appendChild(interim);
        }
        //update the interim p with the speech result
        document.querySelector(".interim").innerHTML = " " + speechResult;
      }
      downloadBtn.disabled = false;
    };
    recognition.onspeechend = () => {
      speechToText();
    };
    recognition.onerror = (event) => {
      stopRecording();
      if (event.error === "no-speech") {
        alert("No speech was detected. Stopping...");
      } else if (event.error === "audio-capture") {
        alert(
          "No microphone was found. Ensure that a microphone is installed."
        );
      } else if (event.error === "not-allowed") {
        alert("Permission to use microphone is blocked.");
      } else if (event.error === "aborted") {
        alert("Listening Stopped.");
      } else {
        alert("Error occurred in recognition: " + event.error);
      }
    };
  } catch (error) {
    recording = false;
    console.log(error);
  }
}

recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

function stopRecording() {
  recognition.stop();
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recordBtn.classList.remove("recording");
  recording = false;
}

function download() {
  const text = finalResult; // Sử dụng kết quả cuối cùng
  const filename= "speech.txt";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

downloadBtn.addEventListener("click", download);

function clearResult() {
  result.innerHTML = '<p class="empty">Click "Start Listening" to record your speech.</p>';
  downloadBtn.disabled = true;
  finalResult = ''; // Đặt lại kết quả cuối cùng
}

clearBtn.addEventListener("click", clearResult);

// Lấy kết quả cuối cùng từ localStorage (nếu có)
var savedText = localStorage.getItem('savedText');
if (savedText) {
  result.innerHTML = savedText;
  downloadBtn.disabled = false;
}

// Xóa kết quả đã lưu trong localStorage
function clearSavedText() {
  localStorage.removeItem('savedText');
}


