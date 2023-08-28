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
    // Lấy danh sách các văn bản đã lưu từ localStorage (nếu có)
    var savedTexts = localStorage.getItem('savedTexts');

    // Kiểm tra xem danh sách đã lưu có tồn tại hay chưa
    if (savedTexts) {
      savedTexts = JSON.parse(savedTexts);
    } else {
      savedTexts = [];
    }

    // Thêm văn bản mới vào danh sách
    savedTexts.push(text);

    // Lưu danh sách đã cập nhật vào localStorage
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
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
      saveText(speechResult); // Lưu văn bản đã chuyển đổi
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
  const text = result.innerText;
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

clearBtn.addEventListener("click", () => {
  result.innerHTML = "";
  downloadBtn.disabled = true;
});

// History
// Hiển thị các văn bản đã lưu
function displaySavedTexts() {
  // Kiểm tra xem localStorage đã được hỗ trợ trong trình duyệt hay chưa
  if (typeof Storage !== 'undefined') {
    // Lấy danh sách các văn bản đã lưu từ localStorage (nếu có)
    var savedTexts = localStorage.getItem('savedTexts');

    // Kiểm tra xem danh sách đã lưu có tồn tại hay chưa
    if (savedTexts) {
      savedTexts = JSON.parse(savedTexts);

      // Xóa nội dung hiện tại của phần tử hiển thị
      savedTextsElement.innerHTML = '';

      // Hiển thị từng văn bản đã lưu trong phần tử hiển thị
      savedTexts.forEach(function (text) {
        var textElement = document.createElement('p');
        textElement.textContent = text;
        savedTextsElement.appendChild(textElement);
      });
    } else {
      savedTextsElement.textContent = 'Chưa có văn bản nào được lưu.';
    }
  } else {
    console.log('LocalStorage không được hỗ trợ trong trình duyệt.');
  }
}

// Gọi hàm hiển thị các văn bản đã lưu khi người dùng nhấp vào nút
viewSavedTextsButton.addEventListener('click', displaySavedTexts);