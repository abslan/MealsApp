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


 let favMeals = localStorage.getItem("lsDataFavMeals");
 if(!favMeals){
     favMeals= [];
     localStorage.setItem("lsDataFavMeals", JSON.stringify(favMeals));
 }else{
     favMeals = JSON.parse(favMeals)
 }

//  event listeners
const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keydown", (e) => {
    if(e.keyCode == 13){
        fetchMealsData();
    }
} )

const toggleAsideDimBtn = document.getElementById("toggle-aside-icon")
toggleAsideDimBtn.onclick = toggleAsideDimension;
function toggleAsideDimension(){
    toggleAsideDimBtn.classList.toggle("fa-expand");
    toggleAsideDimBtn.classList.toggle("fa-compress");
    document.querySelector("aside").classList.toggle("expand-aside");
}

const toggleAsideBtn = document.getElementById("toggle-favourites")
toggleAsideBtn.onclick = toggleAsideContainer;
function toggleAsideContainer(){
    document.querySelector("aside").classList.toggle("hide");
}


const fetchData = async (url) => {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
}

function isFavourite(mealId) {
    return favMeals.indexOf(String(mealId))!==-1;
}

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

async function fetchFavCard(id){
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i="+id;
    const data = await fetchData(url);
    const meal = data.meals[0];
    const html = mealCard(meal);
    return html;
}

async function fetchAllFavCards(){
    for(var id of favMeals){
        // console.log("fetching for ", i);
        const html = await fetchFavCard(id);
        document.getElementById("fav-meals-container").innerHTML+=html;
    }
}

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

fetchMealsData();
fetchAllFavCards();


