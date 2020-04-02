/*
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

  /*
  Déclarations
  */
      // Generals
      const apiKey = 'fb2d49e718e54609ac8b933b920029d1';
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
      const addBookmark = document.querySelector('#addToBookmark');
  //

  /*
  Fonctions
  */

  const getSource = () => {
    new FETCHrequest(
      `${apiUrl}/news/sources`,
      'POST', {
          "news_api_token": apiKey
        }
      )
    .fetch()
    .then( fetchData => {
      displaySourceOption(fetchData.data.sources);
    })
    .catch( fetchError => {
        console.log(fetchError)
    })
  }

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
        displayBookmarkList(fetchData.data.bookmark);

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
        // If source without keyword
        if(searchSourceData.value.length > 0 && searchKeywordData.value.length === 0){
          const urlSearch = `${apiUrl}/news/${searchSourceData.value}/null`;
          new FETCHrequest(urlSearch,
            'POST', {
              "news_api_token": apiKey
            }
          )
          .fetch()
          .then( fetchData => {
              displayNewsList(fetchData.data.articles);
          })
          .catch( fetchError => {
              console.log(fetchError)
          })
        }
        // If source with keyword
        else if (searchSourceData.value.length > 0 && searchKeywordData.value.length > 0) {
          const urlSearch = `${apiUrl}/news/${searchSourceData.value}/${searchKeywordData.value}`;
          new FETCHrequest(urlSearch,
            'POST', {
                "news_api_token": apiKey
              }
            )
          .fetch()
          .then( fetchData => {
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

  const displayNewsList = collection => {
    // searchSourceData.value = '';
    // searchKeywordData.value = '';
    newsList.innerHTML = '';

    for( let i = 0; i < 10; i++ ) {
        newsList.innerHTML += `
            <article>
                <div>
                  <figure>
                      <img src="${collection[i].urlToImage}" alt="${collection[i].title}">
                      <figcaption news-id="${collection[i].source.id}">${collection[i].title}</figcaption>
                  </figure>
                </div>
                <div>
                  <h3>${collection[i].source.name}</h3>
                  <p>${collection[i].description}</p>
                  <a href="${collection[i].url}" target="_blank">Voir l\'article</a>
                </div>
            </article>
        `;
    };
  }

  const displaySourceOption = list => {
    // Recuperer toutes les infos des sources pour l'ajout au favoris
    // Recuperer l'id et le name de la source pour l'afficher dans l'option du select
    for( let i = 0; i < list.length; i++ ) {
      searchSourceData.innerHTML += `<option value="${list[i].id}">${list[i].name}</option>`;
    };

    searchSourceData.addEventListener('change', event => {
      for(let item of list) {
        if(item.id === event.target.value){
          addFavorite(item);
        }
      }
    });
  }


  const addFavorite = data => {
    addBookmark.addEventListener('click', () => {
      new FETCHrequest(
        `${apiUrl}/bookmark`,
        'POST', {
            'id': data.id,
            'name': data.name,
            'description': data.description,
            'url': data.url,
            'category': data.category,
            'language': data.language,
            'country': data.country,
            'token': localStorage.getItem(localSt),
          }
        )
      .fetch()
      .then( fetchData => {
        console.log(fetchData);
        checkUserToken();
      })
      .catch( fetchError => {
          console.log(fetchError)
      })
    })
  }

  const displayBookmarkList = bookmark => {
    favoriteList.innerHTML = '';

    for( let i = 0; i < bookmark.length; i++ ) {
      favoriteList.innerHTML += `
          <div class="fav-item ${bookmark[i].id}">
            <a href="${bookmark[i].url}">${bookmark[i].name}</a>
            <span id="remove-favorite" news-id="${bookmark[i].id}"><i class="fas fa-minus-square"></i></span>
          </div>
        `;
    };

    let allButtonDelete = document.querySelectorAll('#remove-favorite');
    deleteBookmark(allButtonDelete);
  }

  const deleteBookmark = favorites => {
    for (let item of favorites) {
        item.addEventListener('click', () => {
            new FETCHrequest(
            `${apiUrl}/bookmark/${item.getAttribute('news-id')}`,
            'DELETE', {
                'token': localStorage.getItem(localSt)
            })
            .fetch()
            .then(fetchData => console.log(fetchData))
            .catch(fetchError => {
                console.log(fetchError)
            })
        })
    }
}

  const displayNav = pseudo => {
    mainNav.innerHTML = `
        <h3><strong>Hello ${pseudo}</strong>, </br>discover news from around the world!</h3>
        <div>
          <button id="fav"><i class="fas fa-heart"></i>Bookmark</button>
          <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i>Log out</button>
        </div>
    `;

    // Display nav + favoriteList
    mainNav.classList.remove('hidden');
    favoriteList.classList.remove('hidden');

    // Logout
    document.querySelector('#logoutBtn').addEventListener('click', () => {
        // Delete LocalStorage
        localStorage.removeItem(localSt);
        mainNav.innerHTML= '';
        registerForm.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        searchForm.classList.remove('open');
    });

    // DIsplay bar favorite
    document.querySelector('#fav').addEventListener('click', () => {
      favoriteList.classList.toggle('visible');
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
        // Display list source
        getSource();
        addFavorite();
        // Get user informations
        checkUserToken();
      }
      else{
        // Display list source
        getSource();
        addFavorite();

        // Register or login area
        getFormSubmit();
      };
});