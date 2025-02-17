import './styles.css';
import { fetchData } from './apiCalls';
import { postDataset } from './apiCalls';
import './images/turing-logo.png';
import RecipeRepository from './classes/RecipeRepository';
import User from './classes/User';
import dom from '../src/domUpdates.js'
// ~~~~~~~~~~~~~~~~~~~~Query Selectors~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const mainSiteHeader = document.querySelector('h1')
const navButtons = document.querySelector('.nav');
const mainRecipeDisplay = document.querySelector('.main__recipe-images-box');
const recipeHeader = document.querySelector('.main__recipe-header');
const sidebarRight = document.querySelector('.sidebar__right');
const recipeSearchInput = document.getElementById('searchbar');
const recipeSearchButton = document.querySelector('.top__search-bar-button');
const addFavoritesButton = document.querySelector('.add-favorites-button');
const removeFavoritesButton = document.querySelector('.remove-favorites-button');
const addToCookListButton = document.querySelector('.add-recipe-to-cook-button');
const cookButton = document.querySelector('.cook-button')
const userInputIngredientID = document.querySelector('.user__pantry-ingrededient-id')
const userInputIngredientAmount = document.querySelector('.user__pantry-ingrededient-amount')
const userSubmitFormButton = document.querySelector('.user__pantry-submit-button')
const inputErrorID = document.querySelector('.input-error-id')
const inputErrorMissing = document.querySelector('.input-error-missing')
// ~~~~~~~~~~~~~~~~~~~~~~~~~Global Variables~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let recipeRepo;
let user;
let ingredients;
// ~~~~~~~~~~~~~~~~~~~~~~~~~Event Listeners~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
window.addEventListener('load', () => {
  fetchData.then(data => {
    instantiateUser(data[0]);
    ingredients = data[1];
    recipeRepo = new RecipeRepository(data[2])
    instantiateRecipeRepo()
  }).catch(error => mainSiteHeader.innerText = 'Error: Please refresh!')

});

mainRecipeDisplay.addEventListener('click', (e) => {
  if(e.target.dataset.recipe) {
    dom.resetRecipeDisplayInfo()
    dom.renderRecipeInfo(e);
  };
});

navButtons.addEventListener('click', function(e) {
  if(e.target.dataset.button)
    dom.redirectNavBar(e);
});
sidebarRight.addEventListener('click', function(e){
  if(e.target.dataset.tag) {
    dom.filterRecipeCards(e);
  };
});
recipeSearchButton.addEventListener('click', function(){
  dom.searchRecipe()
});
recipeSearchInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.querySelector('.top__search-bar-button').click();
  };
});
addFavoritesButton.addEventListener('click', addToUserList);
removeFavoritesButton.addEventListener('click', removeFromUserList);
addToCookListButton.addEventListener('click', function(e) {
  addToUserList(e)
});
cookButton.addEventListener('click', function(){
  dom.cookThisRecipe();
});
userSubmitFormButton.addEventListener('click', function() {
  initiatePost()


})
// ~~~~~~~~~~~~~~~~~~~~~~~~~Functions~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function instantiateRecipeRepo (){
    recipeRepo.instantiateRecipes();
    dom.populateRecipeCards(recipeRepo.allRecipes, ingredients);
};

function instantiateUser (usersData) {
  let randomUserInfo = usersData[Math.floor(Math.random()*usersData.length)];
  user = new User(randomUserInfo.name, randomUserInfo.id);
  user.stockPantry(randomUserInfo.pantry)
};

function addToUserList (e) {
  if(e.target.dataset.button === 'add-favorite') {
    removeFavoritesButton.style = 'color: red'
    removeFavoritesButton.disabled = false
    var listArray = user.favoriteRecipes
    addFavoritesButton.innerText = 'Added to Favorites'
  }
  if(e.target.dataset.button === 'add-cook-list') {
    var listArray = user.recipesToCook
    addToCookListButton.innerText = 'Added to Cook List'
  }
  let userFavRecipe = recipeRepo.allRecipes.find(recipe => recipe.name === recipeHeader.innerText);
  if(!user.favoriteRecipes.includes(userFavRecipe)){
    user.addRecipeToList(userFavRecipe, listArray);
  };

};

function removeFromUserList () {
  removeFavoritesButton.disabled = true
  removeFavoritesButton.style = 'color: gray'
  let userFavRecipe = user.favoriteRecipes.find(recipe => recipe.name === recipeHeader.innerText);
  user.removeRecipeFromList(userFavRecipe, user.favoriteRecipes);
  addFavoritesButton.innerText = 'Add To Favorites'
};

function initiatePost () {
  if (!userInputIngredientAmount.value || !userInputIngredientID.value){
    inputErrorID.classList.add('hidden')
    inputErrorMissing.classList.remove('hidden')
    return
  }

  if (!recipeRepo.allRecipes[0].allIngredients.find(item => item.id === parseInt(userInputIngredientID.value))) {
    inputErrorMissing.classList.add('hidden')
    inputErrorID.classList.remove('hidden')
    return
  }
  
  postDataset(user.id, parseInt(userInputIngredientID.value), parseInt(userInputIngredientAmount.value))
  
  updateUsersPantry()
  inputErrorID.classList.add('hidden')
  inputErrorMissing.classList.add('hidden')
  userInputIngredientAmount.value = '';
  userInputIngredientID.value = '';
};

function updateUsersPantry() {
  fetchData.then(data => {
      let userData = data[0].find(person => person.id === user.id);
      user = new User(userData.name, userData.id)
      user.stockPantry(userData.pantry)
      dom.createPantryHTML()
  })
}

      

export { recipeRepo, user, ingredients, recipeHeader, mainRecipeDisplay, recipeSearchInput, recipeSearchButton, addFavoritesButton, removeFavoritesButton,addToCookListButton, cookButton, updateUsersPantry}
