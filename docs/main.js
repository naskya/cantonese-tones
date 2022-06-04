const dictionary = (() => {
  let result = [];

  {
    const request = new XMLHttpRequest();
    request.open("get", "dict/cccanto-webdist.txt", false);
    request.send(null);

    const data = request.responseText.split("\n");

    for (let i = 0; i < data.length; ++i) {
      if (data[i].length === 0 || data[i][0] === "#") {
        continue;
      }

      const line = data[i].split(" ");

      if (line[0].length !== 2) {
        continue;
      }

      let first, second;

      for (let j = 2; j < line.length; ++j) {
        if (line[j].startsWith("{")) {
          if (line[j].endsWith("}")) {
            for (let k = 1; k < line[j].length - 1; ++k) {
              if (line[j][k] == "1" || line[j][k] == "2" || line[j][k] == "3"
                || line[j][k] == "4" || line[j][k] == "5" || line[j][k] == "6") {
                first = line[j].slice(1, k + 1);
                second = line[j].slice(k + 1, -1);
                break;
              }
            }
          } else {
            first = line[j].slice(1);
            second = line[j + 1].slice(0, -1);
          }
          break;
        }
      }

      result.push([line[0], line[1], first, second]);
    }
  }

  {
    const request = new XMLHttpRequest();
    request.open("get", "dict/cccedict-canto-readings-150923.txt", false);
    request.send(null);

    const data = request.responseText.split("\n");

    for (let i = 0; i < data.length; ++i) {
      if (data[i].length === 0 || data[i][0] === "#") {
        continue;
      }

      const line = data[i].split(" ");

      if (line[0].length !== 2) {
        continue;
      }

      result.push([line[0], line[1], line[line.length - 2].slice(1), line[line.length - 1].slice(0, -1)]);
    }
  }

  return result;
})();

const inputElem = document.getElementById("word-list-input");
const tableElem = document.getElementById("table");
const failedElem = document.getElementById("failed");
const failedDescElem = document.getElementById("failed-description");
const failedWordsElem = document.getElementById("failed-words");
const detailElem = document.getElementById("detail");
const tonesElem = document.getElementById("tones");
const jyutpingElem = document.getElementById("jyutping");

const cellElems = (() => {
  let result = [];
  for (let i = 0; i <= 6; ++i) {
    result.push([]);
    for (let j = 0; j <= 6; ++j) {
      result[i].push(document.getElementById(`c${i}${j}`));
    }
  }
  return result;
})();

function init(useSimplified) {
  failedElem.classList.add("hidden");
  tableElem.classList.add("hidden");
  detailElem.classList.add("hidden");

  failedDescElem.innerText = "";
  failedWordsElem.innerHTML = "";

  if (useSimplified) {
    jyutpingElem.classList.add("simplified");
    jyutpingElem.classList.remove("traditional");
  } else {
    jyutpingElem.classList.add("traditional");
    jyutpingElem.classList.remove("simplified");
  }

  for (let i = 1; i <= 6; ++i) {
    for (let j = 1; j <= 6; ++j) {
      cellElems[i][j].innerText = "";
      if (useSimplified) {
        cellElems[i][j].classList.add("simplified");
        cellElems[i][j].classList.remove("traditional");
      } else {
        cellElems[i][j].classList.add("traditional");
        cellElems[i][j].classList.remove("simplified");
      }
    }
  }
}

function e() {
  if (inputElem.value === "") {
    return;
  }

  const useSimplified = (document.querySelector("input[name=character-set]:checked").value === "simplified");
  init(useSimplified);

  const words = inputElem.value.replace(/[\s,　，]+/g, ",").replace(/^,|,$/g, "").split(",");

  let convertedWordIndices = Array(words.length).fill(-1);
  let numberFailed = 0;

  for (let i = 0; i < words.length; ++i) {
    for (let j = 0; j < dictionary.length; ++j) {
      if (words[i] === dictionary[j][0] || words[i] === dictionary[j][1]) {
        convertedWordIndices[i] = j;
        break;
      }
    }
    if (convertedWordIndices[i] === -1) {
      ++numberFailed;
    }
  }

  if (numberFailed > 0) {
    failedElem.classList.remove("hidden");
    failedDescElem.innerText = `以下の ${numberFailed} 個の単語の分類に失敗しました。辞書に無い単語または二字でない単語である可能性があります。`;
    failedWordsElem.innerHTML = "<ul>";
  }
  tableElem.classList.remove("hidden");

  for (let i = 0; i < convertedWordIndices.length; ++i) {
    if (convertedWordIndices[i] === -1) {
      failedWordsElem.innerHTML += `<li>${words[i]}</li>`;
    } else {
      const first = dictionary[convertedWordIndices[i]][2];
      const second = dictionary[convertedWordIndices[i]][3];
      const cellElem = cellElems[Number(first[first.length - 1])][Number(second[second.length - 1])];
      if (cellElem.innerHTML.length > 0) {
        cellElem.innerHTML += "&nbsp;";
      }
      cellElem.innerHTML += dictionary[convertedWordIndices[i]][useSimplified ? 1 : 0];
    }
  }

  failedWordsElem.innerHTML += "</ul>";
}

const img1Elem = document.getElementById("img1");
const img2Elem = document.getElementById("img2");

function s(u, v) {
  jyutpingElem.innerHTML = "";
  tonesElem.innerHTML = `${u} 声 - ${v} 声`;

  detailElem.classList.remove("hidden");
  img1Elem.setAttribute("src", `img/${u}.svg`);
  img2Elem.setAttribute("src", `img/${v}.svg`);

  // ToDo: improve the algorithm
  const words = cellElems[u][v].innerHTML.split("&nbsp;");

  for (let i = 0; i < words.length; ++i) {
    for (let j = 0; j < dictionary.length; ++j) {
      if (words[i] === dictionary[j][0] || words[i] === dictionary[j][1]) {
        if (jyutpingElem.innerHTML.length > 0) {
          jyutpingElem.innerHTML += ",&nbsp;";
        }
        jyutpingElem.innerHTML += `${words[i]}:&nbsp;${dictionary[j][2]}&nbsp;${dictionary[j][3]}`;
        break;
      }
    }
  }
}
