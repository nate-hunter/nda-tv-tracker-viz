const btns = document.querySelectorAll('button[data-studio]');
const form = document.querySelector('form');
const formStudio = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

let studio = 'ae'

const handleBtnClick = (e) => {
    studio = e.target.dataset.studio;  // Gets the clicked studio's name
    btns.forEach(btn => btn.classList.remove('active'));  // Removes 'active' class from all studios
    e.target.classList.add('active');  // Applies 'active' class to clicked studio
    input.setAttribute('id', studio);  // Updates the 'id' attr in the form's input to the clicked studio
    formStudio.textContent = studio;  // Sets the text w/in the form's input to the clicked studio
}

const handleFormSubmit = (e) => {
    e.preventDefault();

    const episodeCount = parseInt(input.value)
    if (episodeCount) {
        db.collection('nda-studios').add({
            studio,
            episodeCount,
            date: new Date().toString()
        })
            .then(() => {
                error.textContent = '';
                input.value = '';
            })
    } else {
        error.textContent = 'Please enter a valid episode number.'
    }
}

// ---- Event listeners:
// Updates the clicked button's active status
btns.forEach(btn => {
    btn.addEventListener('click', handleBtnClick);
})

// -- Form Submit
form.addEventListener('submit', handleFormSubmit);