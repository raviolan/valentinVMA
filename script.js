const voteBtn = document.getElementById('voteBtn');
const votePopup = document.getElementById('votePopup');
const closeBtn = document.getElementById('closePopup');
const minimizeBtn = document.getElementById('minimizePopup');
const reopenBtn = document.getElementById('reopenPopup');

// Helper to hide with animation
function hidePopup(callback) {
    votePopup.classList.remove('animate-in');
    votePopup.classList.add('animate-out');

    // Wait for animation to finish, then hide
    setTimeout(() => {
        votePopup.classList.add('hidden');
        votePopup.classList.remove('animate-out');
        if (callback) callback();
    }, 300);
}

voteBtn.addEventListener('click', () => {
    votePopup.classList.remove('hidden');
    votePopup.classList.add('animate-in');
    voteBtn.classList.add('hidden');
    reopenBtn.classList.add('hidden');
});

closeBtn.addEventListener('click', () => {
    hidePopup(() => {
        voteBtn.classList.remove('hidden');
        reopenBtn.classList.add('hidden');
    });
});

minimizeBtn.addEventListener('click', () => {
    hidePopup(() => {
        reopenBtn.classList.remove('hidden');
        voteBtn.classList.add('hidden');
    });
});

reopenBtn.addEventListener('click', () => {
    votePopup.classList.remove('hidden');
    votePopup.classList.add('animate-in');
    reopenBtn.classList.add('hidden');
    voteBtn.classList.add('hidden');
});
