//MEALS TODO ;
/**
 * 1. change theme 
 *      - normal & dark
 *      - use css variables
 * 2. add text styling to 
 *      - cards - title, description
 *      - fav card - title , description
 * 4. Add animations
 *      - meal card
 *      - favourite card
 *      - aside section - should appear slowly from thin air
 * 5. details section
 *         - add expand button in footer and apply below style when clicked
 *         - should float on top of screen
 *          -make background blur
 * 
 * 6. when click on meal card scroll to top - DONE but need more smoothness i guess
 * 7. update local storage for favourite items - DONE
 * 8. searchbox onEnter update meal list -DONE
 * 9. handle when no meals are fetched for a keyword - DONE
 * 10. favourite add to fav list in local storage -DONE
 * 3. Add style to fav card container - DONE
 *      -img, title, description, link
 */





/* This code is checking if there is any data stored in the local storage with the key
"lsDataFavMeals". If there is no data, it initializes the `favMeals` variable as an empty array and
stores it in the local storage. If there is data, it retrieves the data from the local storage and
parses it into an array, assigning it to the `favMeals` variable. This code is used to store and
retrieve the favorite meals from the local storage. */
 let favMeals = localStorage.getItem("lsDataFavMeals");
 if(!favMeals){
     favMeals= [];
     localStorage.setItem("lsDataFavMeals", JSON.stringify(favMeals));
 }else{
     favMeals = JSON.parse(favMeals)
 }

//  event listeners
/* This code is adding an event listener to the search box element with the id "search-box". It listens
for the "keydown" event, which occurs when a key is pressed down. If the key code of the pressed key
is 13 (which corresponds to the Enter key), it calls the fetchMealsData() function. This allows the
user to press Enter in the search box to fetch meals data. */
const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keydown", (e) => {
    if(e.keyCode == 13){
        fetchMealsData();
    }
} )

/**
 * The function toggles the dimensions of an aside element and updates the class of a button icon
 * accordingly.
 */
const toggleAsideDimBtn = document.getElementById("toggle-aside-icon")
toggleAsideDimBtn.onclick = toggleAsideDimension;
function toggleAsideDimension(){
    toggleAsideDimBtn.classList.toggle("fa-expand");
    toggleAsideDimBtn.classList.toggle("fa-compress");
    document.querySelector("aside").classList.toggle("expand-aside");
}

/**
 * The function toggles the visibility of the aside container when the toggle button is clicked.
 */
const toggleAsideBtn = document.getElementById("toggle-favourites")
toggleAsideBtn.onclick = toggleAsideContainer;
function toggleAsideContainer(){
    document.querySelector("aside").classList.toggle("hide");
}


/**
 * The fetchData function is an asynchronous function that fetches data from a specified URL and
 * returns it as a JSON object.
 * @param url - The `url` parameter is a string that represents the URL of the resource you want to
 * fetch data from.
 * @returns The function `fetchData` returns a Promise that resolves to a JSON object.
 */
const fetchData = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

/**
 * The `truncate` function takes a string and a number as input and returns a truncated version of the
 * string if it exceeds the specified length, with "..." appended at the end.
 * @param str - The `str` parameter is a string that you want to truncate if its length exceeds a
 * certain number of characters.
 * @param n - The parameter `n` represents the maximum length of the string `str` after truncation.
 * @returns a truncated version of the input string. If the length of the string is greater than the
 * specified limit (n), it will return the first n-1 characters of the string followed by "...".
 * Otherwise, it will return the original string.
 */
function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
}

/**
 * The function checks if a given mealId is in the favMeals array.
 * @param mealId - The `mealId` parameter is the ID of a meal.
 * @returns a boolean value. It will return true if the mealId is found in the favMeals array, and
 * false otherwise.
 */
function isFavourite(mealId) {
    return favMeals.indexOf(String(mealId))!==-1;
}

/**
 * The function `toggleFavourite` is used to add or remove a meal from the list of favorite meals and
 * update the UI accordingly.
 * @param e - The parameter "e" is an event object that represents the event that triggered the
 * function. It is typically used to access information about the event, such as the target element
 * that triggered the event.
 * @param id - The `id` parameter represents the unique identifier of a meal.
 */
async function toggleFavourite(e, id){
    let favClass = "fav-style";
    let index = favMeals.indexOf(String(id));
    if(index!==-1){
        let cardClass = ".meal-card-"+id;
        let query = "aside "+ cardClass;
        const node = document.querySelectorAll(query)
        favMeals.splice(index, 1);
        node[0].remove();
    }else{
        favMeals.push(String(id));
        const html = await fetchFavCard(id);
        document.getElementById("fav-meals-container").innerHTML+=html;
    }
    e.target.classList.toggle(favClass);
    localStorage.setItem("lsDataFavMeals", JSON.stringify(favMeals));
}

/**
 * The function fetchFavCard fetches a meal card from an API based on the provided id.
 * @param id - The `id` parameter is the unique identifier of a meal. It is used to fetch the details
 * of a specific meal from the API.
 * @returns an HTML string that represents a meal card.
 */
async function fetchFavCard(id){
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id;
    const data = await fetchData(url);
    const meal = data.meals[0];
    const html = mealCard(meal);
    return html;
}

/**
 * The function fetchAllFavCards fetches and displays favorite meal cards on a webpage.
 */
async function fetchAllFavCards(){
    for(var id of favMeals){
        // console.log("fetching for ", i);
        const html = await fetchFavCard(id);
        document.getElementById("fav-meals-container").innerHTML+=html;
    }
}

/**
 * The function `updateCurrentMeal` fetches data from an API, extracts relevant information, and
 * dynamically generates HTML to display the current meal's details.
 * @param id - The `id` parameter is the ID of the meal that you want to update the current meal with.
 */
async function updateCurrentMeal(id){
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id;
    const data = await fetchData(url);
    const currentMeal = data.meals[0];
    let html = null;
    let ingredients = [];
    Array.from(Array(20).keys()).map((i) =>{
        if(currentMeal["strIngredient"+(i+1)].length>1){
            ingredients.push(`${currentMeal["strIngredient"+(i+1)]}(${currentMeal["strMeasure"+(i+1)]})`)
        }});
    html = `
        <div id="current-meal-card"> 
            <div class="current-meal-img">
                <img src="${currentMeal.strMealThumb}" alt="Current meal"/>
            </div>
            <div class="current-meal-info-container">
                <img src="${currentMeal.strMealThumb}" alt=""/>
                <div class="current-meal-info";">
                    <p class="current-meal-name"><span class="info-names">NAME:</span> ${currentMeal.strMeal}</p>
                    <p class="current-meal-category"><span class="info-names">CATEGORY:</span>  ${currentMeal.strCategory}</p>
                    <p class="current-meal-ingredients"><span class="info-names">INGREDIENTS:</span> ${ingredients}</p>
                    <p class="current-meal-instructions"><span class="info-names">INSTRUCTIONS:</span> ${currentMeal.strInstructions}</p>
                </div>
                <div class="current-meal-footer">
                        <a href="${currentMeal.strYoutube}">
                        <i class="fa-brands fa-youtube fa-lg" ></i>
                        </a>
                        <i class="fa-solid fa-heart fa-lg ${isFavourite(currentMeal.idMeal) ? 'fav-style' : ''} "
                    onclick = "toggleFavourite(event, ${ currentMeal.idMeal})" ></i>
                </div>
            </div>
        </div>
    `


    document.getElementById("current-meal-card-container").innerHTML = html;
    // document.body.scrollTop =0;
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

    if(document.querySelector("aside").classList.contains("expand-aside")){
        toggleAsideDimension();
    }
    

}

/**
 * The function fetches meals data from an API based on user input, generates HTML for each meal,
 * updates the current meal, and displays the meals on the webpage.
 */
async function fetchMealsData() {
    console.log("loading data")
    const inputValue = document.getElementById("search-box").value;
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=" + inputValue;
    const mealsData = await fetchData(url);
    console.log("fetched data", mealsData, url, inputValue)
    let html = '';
    if (mealsData.meals) {
        html = mealsData.meals.map(meal => {
            return mealCard(meal)
     }).join('');
    
    const randomId = mealsData.meals[0].idMeal;
    await updateCurrentMeal(randomId);
    document.getElementById('meals-container').innerHTML = html;
    }
    else{
        alert("No such meal found")
    }
}

/**
 * The `mealCard` function generates HTML code for a meal card, including an image, meal name,
 * instructions, YouTube link, and a heart icon for favoriting the meal.
 * @param meal - The `meal` parameter is an object that represents a meal. It has the following
 * properties:
 * @returns The `mealCard` function is returning a string of HTML code.
 */
function mealCard(meal){
    return `
    <div class="meal-card meal-card-${meal.idMeal}"> 
        <div class="meal-img" onclick="updateCurrentMeal(${meal.idMeal})">
        <img src="${meal.strMealThumb}" alt=""/>
        </div>
        <div class="meal-info">
            <p class="meal-name">${truncate(meal.strMeal, 40)}</p>
            <div class="meal-details">
                <p>${truncate(meal.strInstructions, 50)}</p>
            </div>
        </div>
        <div class="meal-footer">
                <a href="${meal.strYoutube}">
                <i class="fa-brands fa-youtube fa-lg"></i>
                </a>
                <i class="fa-solid fa-heart fa-lg ${isFavourite(meal.idMeal) ? 'fav-style' : ''} "
                onclick = "toggleFavourite(event, ${ meal.idMeal})" ></i>
        </div>
    </div>
    `
}


/* The `//App initialization` section is responsible for initializing the application by calling the
`fetchMealsData()` function to fetch and display meals data, and the `fetchAllFavCards()` function
to fetch and display favorite meal cards. This section ensures that the initial data is loaded and
displayed when the application starts. */
//App initialization
fetchMealsData();
fetchAllFavCards();


