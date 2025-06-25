// step 1: grab carousel buttons, boxes. used getelementbyid bc fast, queryselector bc easy.
let nextDom = document.getElementById("next"); // next button
let prevDom = document.getElementById("prev"); // prev button
let carouselDom = document.querySelector(".carousel"); // carousel box
let SliderDom = carouselDom.querySelector(".carousel .list"); // slides area
let thumbnailBorderDom = document.querySelector(".carousel .thumbnail"); // thumbnails area
let timeDom = document.querySelector(".carousel .time"); // timer

// step 2: save slides, thumbnails as arrays. used array.from bc easy looping.
let originalItems = Array.from(
  SliderDom.querySelectorAll(".carousel .list .item")
);
let originalThumbnails = Array.from(
  thumbnailBorderDom.querySelectorAll(".carousel .thumbnail .item")
);

thumbnailBorderDom.appendChild(originalThumbnails[0]); // move 1st thumbnail to end

// step 3: set vars for time, slide, copies. used spread bc safe copy.
let timeRunning = 2000;
let currentIndex = 0;
const totalItems = originalItems.length;

let filteredItems = [...originalItems];
let filteredThumbnails = [...originalThumbnails];

// function 1: clicks next to slide forward. used onclick bc simple for buttons.
nextDom.onclick = function () {
  showSlider("next"); // slide next
};

// function 2: clicks prev to slide back. used onclick bc simple for buttons.
prevDom.onclick = function () {
  showSlider("prev"); // slide prev
};

// timeout var
let runTimeOut; // holds cleanup id

// function 3: slides carousel, animates. used modulo bc loops, timeout bc timing.
function showSlider(type) {
  const total = filteredItems.length; // slide count
  if (type === "next") {
    currentIndex = (currentIndex + 1) % total;
  } else {
    currentIndex = (currentIndex - 1 + total) % total;
  }

  while (SliderDom.firstChild) {
    SliderDom.removeChild(SliderDom.firstChild); // clear slides
  }
  while (thumbnailBorderDom.firstChild) {
    thumbnailBorderDom.removeChild(thumbnailBorderDom.firstChild); // clear thumbnails
  }

  for (let i = 0; i < total; i++) {
    let index = (currentIndex + i) % total; // pick slide
    SliderDom.appendChild(filteredItems[index]); // add slide
    thumbnailBorderDom.appendChild(filteredThumbnails[index]); // add thumbnail
  }

  carouselDom.classList.add(type); // animate
  const newFirst = SliderDom.querySelector(".item"); // new slide
  const content = newFirst.querySelector(".content"); // slide content
  if (content) {
    content.style.filter = "blur(20px)"; // blurry start
    content.style.opacity = "0"; // hidden start
    content.style.animation = "showContent 0.5s 1s linear 1 forwards"; // fade in
  }

  clearTimeout(runTimeOut); // stop old cleanup
  runTimeOut = setTimeout(() => {
    // cleanup after 2 sec
    carouselDom.classList.remove("next"); // remove animation
    carouselDom.classList.remove("prev");
  }, timeRunning);
}

// function 4: pops up video trailer. used createelement bc builds custom popup.
function openTrailerPopup(videoId) {
  let modal = document.createElement("div"); // dark overlay
  modal.className = "modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  let modalContent = document.createElement("div"); // video box
  modalContent.className = "modal-content";
  modalContent.style.cssText = `
    background: #000;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-width: 800px;
    position: relative;
  `;

  let video = document.createElement("video"); // player
  video.controls = true;
  video.style.cssText = "width: 100%; height: auto;";
  let source = document.createElement("source");
  source.src = document.getElementById(videoId).src; // video from id
  source.type = "video/mp4";
  video.appendChild(source);

  let closeBtn = document.createElement("button"); // x button
  closeBtn.innerHTML = "X";
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff0040;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    border-radius: 50%;
    width: 30px;
    height: 30px;
  `;

  // function 5: closes video popup. used onclick bc simple for button.
  closeBtn.onclick = function () {
    document.body.removeChild(modal); // close popup
  };

  modalContent.appendChild(video); // add video
  modalContent.appendChild(closeBtn); // add button
  modal.appendChild(modalContent); // box to overlay
  document.body.appendChild(modal); // show popup
}

// function 6: downloads video with link. used split bc grabs filename.
function downloadVideo(videoSrc) {
  let link = document.createElement("a"); // temp link
  link.href = videoSrc; // video url
  link.download = videoSrc.split("/").pop(); // filename
  document.body.appendChild(link);
  link.click(); // start download
  document.body.removeChild(link); // clean up
}

// function 7: watches trailer, download clicks. used classlist bc checks buttons.
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("trailer-btn")) {
    const item = event.target.closest(".item"); // get slide
    const videoId = item.querySelector(".vid-box video").id; // video id
    openTrailerPopup(videoId); // show trailer
  }
  if (event.target.classList.contains("download-btn")) {
    const item = event.target.closest(".item"); // get slide
    const videoSrc = item.querySelector(".vid-box video").src; // video url
    downloadVideo(videoSrc); // download video
  }
});

// step 4: sets search box, no-results msg. used queryselector bc easy.
const searchInput = document.querySelector(".search-box input"); // search input
const noResultsMessage = document.createElement("div"); // no-match msg
noResultsMessage.className = "no-results";
noResultsMessage.textContent = "No results found";
noResultsMessage.style.display = "none";
carouselDom.appendChild(noResultsMessage);

// function 8: filters slides by search. used foreach bc loops titles.
searchInput.addEventListener("input", function () {
  const query = searchInput.value.trim().toLowerCase(); // typed text
  let hasMatches = false; // any matches
  let bestMatchIndex = -1; // best match
  filteredItems = []; // reset slides
  filteredThumbnails = []; // reset thumbnails
  originalItems.forEach((item, index) => {
    const title = item.querySelector(".content h1").textContent.toLowerCase(); // slide title
    const thumbnail = originalThumbnails[index]; // thumbnail
    if (query === "" || title.includes(query)) {
      // empty or match
      item.style.display = "block"; // show slide
      thumbnail.style.display = "block"; // show thumbnail
      hasMatches = true; // found match
      filteredItems.push(item); // add slide
      filteredThumbnails.push(thumbnail); // add thumbnail
      if (title.startsWith(query) && bestMatchIndex === -1) {
        // best match
        bestMatchIndex = filteredItems.length - 1;
      }
    } else {
      item.style.display = "none"; // hide slide
      thumbnail.style.display = "none"; // hide thumbnail
    }
  });
  noResultsMessage.style.display = query && !hasMatches ? "block" : "none"; // show no-results
  if (query && hasMatches && bestMatchIndex !== -1) {
    currentIndex = bestMatchIndex; // start at best
    while (SliderDom.firstChild) {
      SliderDom.removeChild(SliderDom.firstChild); // clear slides
    }
    while (thumbnailBorderDom.firstChild) {
      thumbnailBorderDom.removeChild(thumbnailBorderDom.firstChild); // clear thumbnails
    }
    for (let i = 0; i < filteredItems.length; i++) {
      let index = (currentIndex + i) % filteredItems.length; // loop order
      SliderDom.appendChild(filteredItems[index]); // add slide
      thumbnailBorderDom.appendChild(filteredThumbnails[index]); // add thumbnail
    }
  }
  if (query === "") {
    // reset if empty
    currentIndex = 0; // start at 0
    filteredItems = [...originalItems]; // all slides
    filteredThumbnails = [...originalThumbnails]; // all thumbnails
    while (SliderDom.firstChild) {
      SliderDom.removeChild(SliderDom.firstChild); // clear slides
    }
    while (thumbnailBorderDom.firstChild) {
      thumbnailBorderDom.removeChild(thumbnailBorderDom.firstChild); // clear thumbnails
    }
    for (let i = 0; i < totalItems; i++) {
      SliderDom.appendChild(originalItems[i]); // add slides
      thumbnailBorderDom.appendChild(originalThumbnails[i]); // add thumbnails
      originalItems[i].style.display = "block"; // show slide
      originalThumbnails[i].style.display = "block"; // show thumbnail
    }
  }
});

// summary:
// step 1 setupCarouselDOM(): grabs buttons and boxes for control. Used getElementById for speed, querySelector for flexibility.
// step 2 storeOriginalItems(): stores slides and thumbnails in arrays. Used Array.from to easily loop over DOM elements.
// step 3 initializeCarouselVars(): sets timing, index, and copies of slides. Spread operator ensures safe cloning of slide data.
// step 4 setupSearchBar(): adds search bar and no-results message. querySelector is used for quick access to DOM elements.
// function 1  nextSlide(): moves slides forward when next button is clicked. onClick event listener used for simplicity.
// function 2 prevSlide(): moves slides back when prev button is clicked. onClick event listener for easy handling of user input.
// function 3 showSlider(type): animates the carousel with a blur effect and loops slides using modulo for wrap-around behavior.
// function 4 openTrailerPopup(videoId): creates and displays trailer popup player. createElement is used to build a custom UI component.
// function 5 closeTrailerPopup(): closes trailer popup when the close button is clicked. onClick event listener used for simplicity.
// function 6 downloadVideo(videoSrc): downloads video file by splitting the URL to grab the filename quickly.
// function 7 handleGlobalClick(): listens for clicks on trailer or download buttons. classList makes it easy to toggle active states.
// function 8 filterSlidesOnSearch() : filters slides based on search input. forEach loop used for iterating through slide titles efficiently.
