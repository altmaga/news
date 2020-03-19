/*
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

  /*
  Déclarations
  */
      const apiUrl = 'https://newsapp.dwsapp.io/api';
      const searchForm = document.querySelector('#searchForm');
      const searchSourceData = document.querySelector('[name="searchSourceData"]');
      const searchKeywordData = document.querySelector('[name="searchKeywordData"]');
      const newsList = document.querySelector('#newsList');
      const titleSearch = document.querySelector('#titleSearch');
  //

  /*
  Fonctions
  */

  const getSource = () => {
    new FETCHrequest(`${apiUrl}/news/sources`, 'GET')
    .fetch()
    .then( fetchData => {
      displaySourceOption(fetchData.data.sources)
    })
    .catch( fetchError => {
        console.log(fetchError)
    })
  }

  const getFormSubmit = () => {
      // Get searchForm submit
      searchForm.addEventListener('submit', event => {
        // Stop event propagation
        event.preventDefault();

        // Check form data
        if(searchSourceData.value.length > 0 && searchKeywordData.value.length === 0){
          const urlSearch = `${apiUrl}/news/${searchSourceData.value}/null`;
          new FETCHrequest(urlSearch, 'GET')
          .fetch()
          .then( fetchData => {
              displayTitleSearch(fetchData.data);
              displayNewsList(fetchData.data.articles);
          })
          .catch( fetchError => {
              console.log(fetchError)
          })
        }
        else if (searchSourceData.value.length > 0 && searchKeywordData.value.length > 0) {
          const urlSearch = `${apiUrl}/news/${searchSourceData.value}/${searchKeywordData.value}`;
          new FETCHrequest(urlSearch, 'GET')
          .fetch()
          .then( fetchData => {
              displayTitleSearch(fetchData.data);
              displayNewsList(fetchData.data.articles);
          })
          .catch( fetchError => {
              console.log(fetchError)
          })
        }
        else{
            console.log('form not ok')
        }
    });
  }

  const displayTitleSearch = title => {
    titleSearch.innerHTML = `Resultat(s) trouvé(s) : ${title.totalResults} pour ${searchSourceData.value} et ${searchKeywordData.value}`;
  }

  const displayNewsList = collection => {
    searchSourceData.value = '';
    searchKeywordData.value = '';
    newsList.innerHTML = '';

    for( let i = 0; i < collection.length; i++ ) {
        newsList.innerHTML += `
            <article>
                <span>${collection[i].source.name}</span>
                <figure>
                    <img src="${collection[i].urlToImage}" alt="${collection[i].title}">
                    <figcaption news-id="${collection[i].source.id}">${collection[i].title}</figcaption>
                </figure>
                <p>${collection[i].description}</p>
                <a href="${collection[i].url}">Voir l\'article</a>
            </article>
        `;
    };
  }

  const displaySourceOption = list => {
      for( let i = 0; i < list.length; i++ ) {
        searchSourceData.innerHTML += `<option value="${list[i].id}">${list[i].name}</option>`;
    };
  }

  /*
  Lancer IHM
  */
      /*
      Start interface by checkingg if user token is prersent
      */

      getSource();
      getFormSubmit();
});