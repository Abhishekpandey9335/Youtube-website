/* ---------------- AUTH MODAL ---------------- */

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginTab.onclick = () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
};

signupTab.onclick = () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
};

function openAuth() {
  document.getElementById("authModal").style.display = "flex";
}

function closeAuth() {
  document.getElementById("authModal").style.display = "none";
}

/* ---------------- VIDEO GALLERY ---------------- */

const videoData = [
  { id: "9QJtEuaki1w", title: "Complete Java", desc: "Start coding", thumbnail: "https://img.youtube.com/vi/9QJtEuaki1w/hqdefault.jpg" },
  { id: "25JC2RIEFYY", title: "Arrays", desc: "Learn arrays", thumbnail: "https://img.youtube.com/vi/25JC2RIEFYY/hqdefault.jpg" },
  { id: "xTkgfhM7cDk", title: "Perfect Number", desc: "Leetcode", thumbnail: "https://img.youtube.com/vi/xTkgfhM7cDk/hqdefault.jpg" }
];

const pageSize = 3;
let currentPage = 1;

function renderGallery(page) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, videoData.length);

  for (let i = start; i < end; i++) {
    const v = videoData[i];
    const card = document.createElement("div");

    card.innerHTML = `
      <img src="${v.thumbnail}">
      <h3>${v.title}</h3>
      <p>${v.desc}</p>
    `;

    card.querySelector("img").onclick = () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${v.id}?autoplay=1`;
      iframe.width = "100%";
      iframe.height = "200";
      iframe.allowFullscreen = true;
      card.replaceWith(iframe);
    };

    gallery.appendChild(card);
  }

  document.getElementById("pageInfo").textContent =
    `Page ${currentPage} of ${Math.ceil(videoData.length / pageSize)}`;
}

document.getElementById("prevPage").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderGallery(currentPage);
  }
};

document.getElementById("nextPage").onclick = () => {
  if (currentPage * pageSize < videoData.length) {
    currentPage++;
    renderGallery(currentPage);
  }
};

renderGallery(currentPage);

/* ---------------- CONTACT FORM ---------------- */

document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("formMsg").textContent = "Message sent (demo)";
});

