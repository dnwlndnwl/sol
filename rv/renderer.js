// 1. 스토리 불러오기
fetch('./data/story.json')

// 2. 채보 불러오기
fetch('./data/chart.json')

// 3. 캐릭터 이미지 (함수 만들어서 쓰기)
const getImgPath = (name) => `./assets/images/${name}`;

// 4. 음악 파일
audio.src = './assets/sounds/flos.mp3';
