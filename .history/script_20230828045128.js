const recordBtn = document.querySelector(".record");
const result = document.querySelector(".result");
const downloadBtn = document.querySelector(".download");
const inputLanguage = document.querySelector("#language");
const clearBtn = document.querySelector(".clear");
const savedTextsElement = document.getElementById('savedTexts');
const viewSavedTextsButton = document.getElementById('viewSavedTexts');
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let recording = false;
let finalResult = '';

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
  if (typeof Storage !== 'undefined') {
    localStorage.setItem('savedText', text);
  } else {
    console.log('LocalStorage is not supported in this browser.');
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
      if (event.results[0].isFinal) {
        finalResult = speechResult;
        result.innerHTML += " " + speechResult;
        result.querySelector("p").remove();
      } else {
        if (!document.querySelector(".interim")) {
          const interim = document.createElement("p");
          interim.classList.add("interim");
          result.appendChild(interim);
        }
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
        alert("No microphone was found. Ensure that a microphone is installed.");
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
  const text = finalResult;
  const filename = "speech.txt";

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
  finalResult = '';
}

clearBtn.addEventListener("click", clearResult);

var savedText = localStorage.getItem('savedText');
if (savedText) {
  result.innerHTML = savedText;
  downloadBtn.disabled = false;
}

function clearSavedText() {
  localStorage.removeItem('savedText');
}

viewSavedTextsButton.addEventListener('click', () => {
  savedTextsElement.textContent = '';
  const savedTexts = Object.values(localStorage);
  savedTexts.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    savedTextsElement.appendChild(p);
  });
});