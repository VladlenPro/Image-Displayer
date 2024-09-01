
let currentPage = 1; // Start with page 1
let displayedCount = 0; // Track the number of images currently displayed
const imagesPerBatch = 20; // Number of images to display per batch
let imagesCache = [];
let numberOfPages = 0;


document.addEventListener('DOMContentLoaded', async () => {
  await fetchRandomImages();
});

document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value.trim();
  if (query) {
      document.getElementById('imageContainer').innerHTML = '';
      currentPage = 1;
      imagesCache = [];
      displayedCount = 0;
      numberOfPages = 0;
      await fetchImages(query);
  }
});

async function fetchImages(query) {
  try {
      const response = await fetch(`http://localhost:5501/api/search?query=${query}&page=${currentPage}`);
      const data = await response.json();
      imagesCache.push(...data.hits);
      numberOfPages = data.totalPages;
      displayNextBatch();
      currentPage++;
  } catch (error) {
      console.error('Error fetching images:', error);
  }
}

async function fetchRandomImages() {
  try {
      const response = await fetch('http://localhost:5501/api/random');
      const data = await response.json();
      imagesCache.push(...data.hits);
      displayNextBatch();
  } catch (error) {
      console.error('Error fetching random images:', error);
  }
}


function displayNextBatch() {
  const nextBatch = imagesCache.slice(displayedCount, displayedCount + imagesPerBatch);
  
  nextBatch.forEach(image => {
      const card = createCard(image);
      addCardToPage(card);
  });

  displayedCount += nextBatch.length;

  if (displayedCount <= imagesCache.length && currentPage <= numberOfPages) {
      document.querySelector('footer').style.display = 'flex';
  } else {
      document.querySelector('footer').style.display = 'none';
  }

  document.getElementById('loadMoreButton').onclick = loadMoreImages;
}

function loadMoreImages() {
  if (displayedCount < imagesCache.length) {
      displayNextBatch();
  } else if (currentPage <= numberOfPages) {
    const query = document.getElementById('searchInput').value.trim();
      fetchImages(query);
  }
}

function createCard(data) {
  const card = document.createElement('div');
  card.className = 'image-card';

  card.innerHTML = `<img src="${data.previewURL}" alt="${data.tags}" 
                      data-largeImageURL="${data.largeImageURL}" 
                      data-user="${data.user}" 
                      data-tags="${data.tags}" 
                      data-likes="${data.likes}" 
                      data-pageURL="${data.pageURL}">
                    <div class="hover-info">
                        <p>User: ${data.user}</p>
                        <p>Tags: ${data.tags}</p>
                    </div>
                    <span class="favorite-icon">&#9829;</span> <!-- Heart icon -->`;
                      

  return card;
}

function addCardToPage(card) {
  const container = document.getElementById('imageContainer');
  container.appendChild(card);
  attachCardListeners();
}

function attachCardListeners() {
  const cards = document.querySelectorAll('.image-card img');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const imageData = {
                largeImageURL: card.getAttribute('data-largeImageURL'),
                user: card.getAttribute('data-user'),
                tags: card.getAttribute('data-tags'),
                likes: card.getAttribute('data-likes'),
                pageURL: card.getAttribute('data-pageURL'),
            };
            openModal(imageData);
        });
    });
}

function openModal(imageData) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalTags = document.getElementById('modalTags');
  const modalLink = document.getElementById('modalLink');
  const modalLikes = document.getElementById('modalLikes');
 
  modalImage.src = imageData.largeImageURL;
  modalTitle.textContent = `By: ${imageData.user}`;
  modalTags.textContent = `Tags: ${imageData.tags}`;
  modalLikes.textContent = `Likes: ${imageData.likes}`;
  modalLink.href = imageData.pageURL;

  modal.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('imageModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
  const modal = document.getElementById('imageModal');
  if (event.target === modal) {
      modal.style.display = 'none';
  }
});

