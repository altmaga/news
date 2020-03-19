/*
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

  /*
  Déclarations
  */
      // Generals
      const apiUrl = 'https://newsapp.dwsapp.io/api';
      const mainNav = document.querySelector('header nav');
      const localSt = 'user._id';
      // Search
      const searchForm = document.querySelector('#searchForm');
      const searchSourceData = document.querySelector('[name="searchSourceData"]');
      const searchKeywordData = document.querySelector('[name="searchKeywordData"]');
      const newsList = document.querySelector('#newsList');
      const titleSearch = document.querySelector('#titleSearch');
      // Register
      const registerForm = document.querySelector('#registerForm');
      const userEmail = document.querySelector('[name="userEmail"]');
      const userPassword = document.querySelector('[name="userPassword"]');
      const userFirstName = document.querySelector('[name="userFirstName"]');
      const userLastName = document.querySelector('[name="userLastName"]');
      // Login
      const loginForm = document.querySelector('#loginForm');
      const loginEmail = document.querySelector('[name="loginEmail"]');
      const loginPassword = document.querySelector('[name="loginPassword"]');
      // Favorite
      const favoriteList = document.querySelector('#favoriteList');
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
  getSource();

  const checkUserToken = () => {
      new FETCHrequest(
          `${apiUrl}/me`,
          'POST', {
            token: localStorage.getItem(localSt)
          }
      )
      .fetch()
      .then( fetchData => {
        console.log(localStorage);
        console.log(fetchData);
        // Hide register and loggin form
        registerForm.classList.add('hidden');
        loginForm.classList.add('hidden');

        // Display nav
        displayNav(fetchData.data.user.firstname);

        // Get form submit event
        getFormSubmit();
      })
      .catch( fetchError => {
          console.log(fetchError)
      })
  }

  const getFormSubmit = () => {
      // Get registerForm submit
      registerForm.addEventListener('submit', event => {
        // Stop event propagation
        event.preventDefault();

        // Check form data
        let formError = 0;

        if(userEmail.value.length < 5) { formError++ };
        if(userPassword.value.length < 5) { formError++ };
        if(userFirstName.value.length < 2) { formError++ };
        if(userLastName.value.length < 2) { formError++ };

        if(formError === 0){
            new FETCHrequest(`${apiUrl}/register`, 'POST', {
                email: userEmail.value,
                password: userPassword.value,
                firstname: userFirstName.value,
                lastname: userLastName.value
            })
            .fetch()
            .then( fetchData => {
                console.log(fetchData)
            })
            .catch( fetchError => {
                console.log(fetchError)
            })
        }
        else {
            console.log('form not ok')
        }
      });
      // Get loginForm submit
      loginForm.addEventListener('submit', event => {
        // Stop event propagation
        event.preventDefault();

        // Check form data
        let formError = 0;

        if(loginEmail.value.length < 5) { formError++ };
        if(loginPassword.value.length < 5) { formError++ };

        if(formError === 0){
            new FETCHrequest(`${apiUrl}/login`, 'POST', {
                email: loginEmail.value,
                password: loginPassword.value
            })
            .fetch()
            .then( fetchData => {
                localStorage.setItem(localSt, fetchData.data.token);
                checkUserToken();
            })
            .catch( fetchError => {
                console.log(fetchError)
            })
        }
        else{
            console.log('form not ok')
        }
      });
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

    for( let i = 0; i < 10; i++ ) {
        newsList.innerHTML += `
            <article>
                <span>${collection[i].source.name}</span>
                <figure>
                    <img src="${collection[i].urlToImage}" alt="${collection[i].title}">
                    <figcaption news-id="${collection[i].source.id}">${collection[i].title}</figcaption>
                </figure>
                <p>${collection[i].description}</p>
                <a href="${collection[i].url}" target="_blank">Voir l\'article</a>
                <button id="favoriteButton"><i class="fas fa-bookmark"></i>${collection[i].source.name}</button>
            </article>
        `;
        // addFavorite(document.querySelector('#favoriteButton'), collection[i]);
    };
  }

  const displaySourceOption = list => {
      for( let i = 0; i < list.length; i++ ) {
        searchSourceData.innerHTML += `<option value="${list[i].id}">${list[i].name}</option>`;
    };
  }

  const displayNav = pseudo => {
    mainNav.innerHTML = `
        <p>Hello ${pseudo}</p>
        <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i></button>
    `;

    mainNav.classList.remove('hidden');
    favoriteList.classList.remove('hidden');

    document.querySelector('#logoutBtn').addEventListener('click', () => {
        // Delete LocalStorage
        localStorage.removeItem(localSt);
        mainNav.innerHTML= '';
        registerForm.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        searchForm.classList.remove('open');
    })
  }

  const addFavorite = (button, data) => {
    button.addEventListener('click', () => {
      new FETCHrequest(`${apiUrl}/bookmark`, 'POST', {
        id: data.source.id,
        name: data.source.name,
        description: data.description,
        url: data.url,
        category: data.category,
        language: data.language,
        country: data.country,
        token: localStorage.getItem(localSt),
    })
    .fetch()
    .then( fetchData => {
      console.log(fetchData);
        // checkUserToken('favorite')
    })
    .catch( fetchError => {
        console.log(fetchError)
    })
      // new FETCHrequest(`${apiUrl}/news/sources`, 'GET')
      // .fetch()
      // .then( fetchData => {
      //   console.log(fetchData);
      // })
      // .catch( fetchError => {
      //     console.log(fetchError)
      // })
    })
  }

  /*
  Lancer IHM
  */
      /*
      Start interface by checkingg if user token is prersent
      */
     if( localStorage.getItem(localSt) !== null ){
        console.log(localStorage.getItem(localSt))
        // Get user onnfoprmations
        checkUserToken();
      }
      else{
          getFormSubmit();
      };
});