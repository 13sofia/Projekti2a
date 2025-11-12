// API-avain Last.fm:ltä
const API_KEY = 'be4070664d8bd91f702754a1105becb3';

// Haetaan HTML-elementit, joihin sisältö lisätään
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const artistList = document.getElementById('artistList');
const albumInfo = document.getElementById('albumInfo');

// Kun käyttäjä klikkaa "Hae"-painiketta
searchBtn.addEventListener('click', () => {
  const artist = searchInput.value.trim(); // otetaan syötetty artistin nimi
  if (artist) {
    getArtistInfo(artist); // haetaan artistin tiedot
    getAlbums(artist);     // haetaan artistin albumit
  }
});

// Haetaan artistin perustiedot (nimi ja kuvaus)
function getArtistInfo(artistName) {
  fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`)
    .then(res => res.json())
    .then(data => {
      const artist = data.artist;
      const bio = artist.bio?.summary || 'Ei kuvausta saatavilla.';
      // Näytetään artistin nimi ja lyhyt kuvaus (ilman kuvaa)
      artistList.innerHTML = `
        <h2>${artist.name}</h2>
        <p>${bio}</p>
      `;
    })
    .catch(err => {
      // Jos artistin tietoja ei löydy
      artistList.innerHTML = `<p>Artistin tietoja ei löytynyt.</p>`;
    });
}

// Haetaan artistin suosituimmat albumit
function getAlbums(artistName) {
  fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json`)
    .then(res => res.json())
    .then(data => {
      const albums = data.topalbums?.album || [];
      albumInfo.innerHTML = `<h2>Albumit: ${artistName}</h2>`;

      // Käydään läpi jokainen albumi
      albums.forEach(album => {
        const div = document.createElement('div');
        div.className = 'album';

        // Luodaan yksilöllinen ID albumin kappalelistalle
        const albumId = album.name.replace(/\s/g, '') + Math.floor(Math.random() * 10000);

        // Luodaan kuva
        const img = document.createElement('img');
        img.src = album.image[2]['#text'];
        img.alt = album.name;

        // Luodaan otsikko
        const title = document.createElement('strong');
        title.textContent = album.name;

        // Luodaan "Näytä kappaleet" -painike dynaamisesti
        const button = document.createElement('button');
        button.textContent = 'Näytä kappaleet';
        button.addEventListener('click', () => getTracks(artistName, album.name, albumId));

        // Luodaan tyhjä div kappalelistan näyttämistä varten
        const trackDiv = document.createElement('div');
        trackDiv.id = `tracks-${albumId}`;

        // Lisätään kaikki elementit albumin diviin
        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(document.createElement('br'));
        div.appendChild(button);
        div.appendChild(trackDiv);

        // Lisätään albumi sivulle
        albumInfo.appendChild(div);
      });
    })
    .catch(err => {
      // Jos albumitietoja ei löydy
      albumInfo.innerHTML = `<p>Albumitietoja ei löytynyt.</p>`;
    });
}

// Haetaan albumin kappaleet
function getTracks(artistName, albumName, albumId) {
  fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}&api_key=${API_KEY}&format=json`)
    .then(res => res.json())
    .then(data => {
      const tracks = data.album?.tracks?.track;

      // Jos kappaleita ei ole saatavilla
      if (!tracks || tracks.length === 0) {
        document.getElementById(`tracks-${albumId}`).innerHTML = `<p>Ei kappaleita saatavilla.</p>`;
        return;
      }

      // Muodostetaan kappalelista HTML:ksi
      const trackList = tracks.map(track => `<li>${track.name}</li>`).join('');
      document.getElementById(`tracks-${albumId}`).innerHTML = `<ul>${trackList}</ul>`;
    })
    .catch(err => {
      // Jos tapahtuu virhe kappaleiden haussa
      document.getElementById(`tracks-${albumId}`).innerHTML = `<p>Virhe kappaleiden haussa.</p>`;
    });
}
