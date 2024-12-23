const socket = io();

socket.on('newWish', (wish) => {
    addpresent(wish); 
});

const existingPositions = []; 
const presentWidth = 100; 

const addpresent = (wish) => {
    const container = document.querySelector('.present-container');
    
    const present = document.createElement('div');
    present.classList.add('present');

    present.style.background = wish.color || '#7E121D';

    const textBackground = document.createElement('div');
    textBackground.classList.add('text-background');
    textBackground.textContent = `${wish.wish}`;
    present.appendChild(textBackground);

    const name = document.createElement('div'); 
    name.classList.add('name');
    name.textContent = `${wish.name}`;

    let randomLeft;
    let positionFound = false;

    while (!positionFound) {
        randomLeft = Math.random() * (window.innerWidth - presentWidth);
        const pixelLeft = Math.round(randomLeft); 

        const overlap = existingPositions.some(pos => {
            return Math.abs(pos - pixelLeft) < presentWidth; 
        });

        if (!overlap) {
            existingPositions.push(pixelLeft); 
            positionFound = true;
        }
    }

    const position = `${randomLeft}px`; 
    present.style.left = position 
    present.style.top = `-80px`; 
    present.style.position = 'absolute'; 

    container.appendChild(present);

    name.style.position = 'absolute';
    name.style.left = `${randomLeft + 13}px`; 
    name.style.top = `-120px`; 
    name.style.transform = 'translateX(-50%)'; 

    container.appendChild(name); 

    present.addEventListener('animationend', async () => {
        present.remove();
        name.remove();
        existingPositions.splice(existingPositions.indexOf(randomLeft), 1); 
        await deleteWish(wish._id);
    });
};